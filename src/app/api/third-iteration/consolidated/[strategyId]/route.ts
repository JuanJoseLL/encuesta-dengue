import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { isThirdIterationIndicator } from "@/domain/constants";

/**
 * GET /api/third-iteration/consolidated/[strategyId]?sessionId=[sessionId]
 * Obtiene las ponderaciones consolidadas de todos los usuarios para una estrategia,
 * tomadas de la SEGUNDA iteración (que es el punto de partida de la tercera).
 * Excluye al usuario actual de los pesos individuales mostrados.
 * En la tercera iteración NO se trabajan umbrales, por lo que no se devuelven.
 * Retorna: { indicators: [ { indicatorId, indicatorName, weights: [], average, count } ] }
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ strategyId: string }> }
) {
  try {
    const { strategyId } = await params;
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    // Obtener el respondent del usuario actual para excluirlo de los pesos mostrados
    let currentRespondentId: string | null = null;
    if (sessionId) {
      const currentSession = await prisma.responseSession.findUnique({
        where: { id: sessionId },
        select: { respondentId: true },
      });
      currentRespondentId = currentSession?.respondentId || null;
    }

    // Obtener todas las respuestas de SEGUNDA iteración para esta estrategia
    const responses = await prisma.secondIterationResponse.findMany({
      where: {
        strategyId,
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

    // Mapa de indicadores (la SecondIterationResponse no tiene relación directa con Indicator)
    const indicators = await prisma.indicator.findMany({
      where: { active: true },
      select: { id: true, name: true, description: true },
    });
    const indicatorInfo = new Map(indicators.map((i) => [i.id, i]));

    // Agrupar por indicador
    const indicatorMap = new Map<string, {
      indicatorId: string;
      indicatorName: string;
      indicatorDescription: string | null;
      weightsForDisplay: number[]; // Pesos de otros (sin el usuario actual)
      allWeights: number[]; // Todos los pesos (incluye usuario actual) - para promedio
      emails: string[];
      totalCount: number;
    }>();

    // Número total de personas únicas que respondieron esta estrategia en la 2da iteración
    const uniqueRespondents = new Set<string>();
    responses.forEach((r) => {
      uniqueRespondents.add(r.session.respondentId);
    });
    const totalRespondents = uniqueRespondents.size;

    for (const response of responses) {
      const indicatorId = response.indicatorId;

      // La tercera iteración solo trabaja un subconjunto de indicadores.
      if (!isThirdIterationIndicator(indicatorId)) continue;

      const info = indicatorInfo.get(indicatorId);
      const indicatorName = info?.name || indicatorId;
      const indicatorDescription = info?.description ?? null;
      const email = response.session.respondent.email;
      const isCurrentUser = response.session.respondentId === currentRespondentId;

      if (!indicatorMap.has(indicatorId)) {
        indicatorMap.set(indicatorId, {
          indicatorId,
          indicatorName,
          indicatorDescription,
          weightsForDisplay: [],
          allWeights: [],
          emails: [],
          totalCount: 0,
        });
      }

      const data = indicatorMap.get(indicatorId)!;

      data.allWeights.push(response.weight);
      data.totalCount++;

      if (!isCurrentUser) {
        data.weightsForDisplay.push(response.weight);
        data.emails.push(email);
      }
    }

    // Calcular estadísticas para cada indicador
    const indicatorsResult = Array.from(indicatorMap.values()).map((data) => {
      const sumAllWeights = data.allWeights.reduce((sum, w) => sum + w, 0);
      const average = totalRespondents > 0 ? sumAllWeights / totalRespondents : 0;

      return {
        indicatorId: data.indicatorId,
        indicatorName: data.indicatorName,
        indicatorDescription: data.indicatorDescription,
        weights: data.weightsForDisplay, // Solo pesos de otros (sin usuario actual)
        thresholds: [] as string[], // La 3ra iteración no usa umbrales
        average: Math.round(average * 100) / 100,
        count: data.totalCount,
        totalRespondents,
      };
    });

    indicatorsResult.sort((a, b) => b.average - a.average);

    return NextResponse.json({
      strategyId,
      totalRespondents,
      indicators: indicatorsResult,
    });
  } catch (error) {
    console.error("Error fetching third iteration consolidated responses:", error);
    return NextResponse.json(
      { error: "Failed to fetch consolidated responses" },
      { status: 500 }
    );
  }
}
