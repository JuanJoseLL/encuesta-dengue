import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/second-iteration/export
 * Exporta las respuestas de segunda iteración en formato similar al script Python
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const surveyId = searchParams.get("surveyId");

    if (!surveyId) {
      return NextResponse.json(
        { error: "surveyId is required" },
        { status: 400 }
      );
    }

    // Obtener todas las respuestas de segunda iteración para la encuesta
    const responses = await prisma.secondIterationResponse.findMany({
      where: {
        session: {
          surveyId,
          status: "submitted",
        },
        excluded: false, // Solo respuestas no excluidas
      },
      include: {
        session: {
          include: {
            respondent: true,
          },
        },
      },
    });

    // Obtener información de estrategias e indicadores
    const strategies = await prisma.strategy.findMany({
      where: {
        surveyId,
        active: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    const indicators = await prisma.indicator.findMany({
      where: {
        active: true,
      },
    });

    // Crear mapa de estrategias e indicadores
    const strategyMap = new Map(strategies.map((s) => [s.id, s]));
    const indicatorMap = new Map(indicators.map((i) => [i.id, i]));

    // Formatear datos para exportación
    const exportData = responses.map((response) => {
      const strategy = strategyMap.get(response.strategyId);
      const indicator = indicatorMap.get(response.indicatorId);

      return {
        email: response.session.respondent.email,
        estrategia: strategy?.metodo || "Unknown",
        "orden estrategia": strategy?.order || 0,
        indicador: indicator?.name || "Unknown",
        peso: response.weight,
        umbral: response.threshold || "",
        "es original": response.isOriginal ? "Sí" : "No",
      };
    });

    // Calcular estadísticas consolidadas (similar al script Python)
    const consolidatedData = await calculateConsolidatedStats(surveyId);

    return NextResponse.json({
      responses: exportData,
      consolidated: consolidatedData,
      metadata: {
        surveyId,
        totalResponses: responses.length,
        exportDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error exporting second iteration data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

/**
 * Calcula estadísticas consolidadas por estrategia e indicador
 * Similar al script Python proporcionado
 */
async function calculateConsolidatedStats(surveyId: string) {
  // Obtener todas las respuestas válidas
  const responses = await prisma.secondIterationResponse.findMany({
    where: {
      session: {
        surveyId,
        status: "submitted",
      },
      excluded: false,
    },
    include: {
      session: {
        include: {
          respondent: true,
        },
      },
    },
  });

  // Obtener información de estrategias e indicadores
  const strategies = await prisma.strategy.findMany({
    where: { surveyId, active: true },
    orderBy: { order: "asc" },
  });

  const indicators = await prisma.indicator.findMany({
    where: { active: true },
  });

  const strategyMap = new Map(strategies.map((s) => [s.id, s]));
  const indicatorMap = new Map(indicators.map((i) => [i.id, i]));

  // Agrupar por estrategia e indicador
  const grouped = new Map<
    string,
    Map<
      string,
      {
        weights: number[];
        thresholds: string[];
        emails: string[];
      }
    >
  >();

  // Calcular número de personas únicas por estrategia
  const peoplePerStrategy = new Map<string, Set<string>>();

  for (const response of responses) {
    if (!grouped.has(response.strategyId)) {
      grouped.set(response.strategyId, new Map());
    }
    if (!peoplePerStrategy.has(response.strategyId)) {
      peoplePerStrategy.set(response.strategyId, new Set());
    }

    const strategyGroup = grouped.get(response.strategyId)!;
    peoplePerStrategy
      .get(response.strategyId)!
      .add(response.session.respondent.email);

    if (!strategyGroup.has(response.indicatorId)) {
      strategyGroup.set(response.indicatorId, {
        weights: [],
        thresholds: [],
        emails: [],
      });
    }

    const indicatorData = strategyGroup.get(response.indicatorId)!;
    indicatorData.weights.push(response.weight);
    if (response.threshold) {
      indicatorData.thresholds.push(response.threshold);
    }
    indicatorData.emails.push(response.session.respondent.email);
  }

  // Calcular estadísticas
  const consolidated = [];

  for (const [strategyId, indicatorGroup] of grouped.entries()) {
    const strategy = strategyMap.get(strategyId);
    const totalPeople = peoplePerStrategy.get(strategyId)?.size || 1;

    const strategyData = [];
    let sumPromedios = 0;

    // Primera pasada: calcular promedios
    for (const [indicatorId, data] of indicatorGroup.entries()) {
      const indicator = indicatorMap.get(indicatorId);
      const sumWeights = data.weights.reduce((sum, w) => sum + w, 0);
      const promedio = sumWeights / totalPeople;
      sumPromedios += promedio;

      strategyData.push({
        indicatorId,
        indicatorName: indicator?.name || "Unknown",
        responses: data.weights.join(","),
        promedio: Math.round(promedio * 100) / 100,
        count: data.weights.length,
        thresholds: data.thresholds.join(","),
      });
    }

    // Segunda pasada: calcular porcentajes normalizados
    for (const item of strategyData) {
      item.porcentajeNormalizado =
        sumPromedios > 0
          ? Math.round((item.promedio / sumPromedios) * 10000) / 100
          : 0;
    }

    // Ordenar por promedio descendente
    strategyData.sort((a, b) => b.promedio - a.promedio);

    consolidated.push({
      estrategia: strategy?.metodo || "Unknown",
      orden: strategy?.order || 0,
      totalPersonas: totalPeople,
      indicadores: strategyData,
    });
  }

  // Ordenar por orden de estrategia
  consolidated.sort((a, b) => a.orden - b.orden);

  return consolidated;
}

