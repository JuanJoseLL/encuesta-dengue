import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/second-iteration/consolidated/[strategyId]?sessionId=[sessionId]
 * Obtiene las respuestas consolidadas de todos los usuarios para una estrategia
 * Excluye al usuario actual de los pesos individuales
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

    // Obtener el respondent del usuario actual para excluirlo
    let currentRespondentId: string | null = null;
    if (sessionId) {
      const currentSession = await prisma.responseSession.findUnique({
        where: { id: sessionId },
        select: { respondentId: true },
      });
      currentRespondentId = currentSession?.respondentId || null;
    }

    // Obtener todas las respuestas para esta estrategia (de todos los usuarios que ya enviaron)
    const responses = await prisma.response.findMany({
      where: {
        strategyId,
        session: {
          status: "submitted", // Solo usuarios que ya enviaron
        },
      },
      include: {
        indicator: true,
        session: {
          include: {
            respondent: true,
          },
        },
      },
    });

    // Agrupar por indicador
    const indicatorMap = new Map<string, {
      indicatorId: string;
      indicatorName: string;
      indicatorDescription: string | null;
      weightsForDisplay: number[]; // Pesos de otros (sin el usuario actual) - para mostrar separados por coma
      allWeights: number[]; // Todos los pesos (incluye usuario actual) - para calcular promedio
      thresholds: string[];
      emails: string[];
      totalCount: number; // Conteo total incluyendo al usuario actual
    }>();

    // Obtener el número total de personas únicas que respondieron esta estrategia
    const uniqueEmails = new Set<string>();
    responses.forEach((r) => {
      uniqueEmails.add(r.session.respondent.email);
    });
    const totalRespondents = uniqueEmails.size;

    for (const response of responses) {
      const indicatorId = response.indicatorId;
      const indicatorName = response.indicator.name;
      const indicatorDescription = response.indicator.description;
      const email = response.session.respondent.email;
      const isCurrentUser = response.session.respondentId === currentRespondentId;

      if (!indicatorMap.has(indicatorId)) {
        indicatorMap.set(indicatorId, {
          indicatorId,
          indicatorName,
          indicatorDescription,
          weightsForDisplay: [],
          allWeights: [],
          thresholds: [],
          emails: [],
          totalCount: 0,
        });
      }

      const data = indicatorMap.get(indicatorId)!;
      
      // Siempre agregar a allWeights y totalCount
      data.allWeights.push(response.weight);
      data.totalCount++;
      
      // Solo agregar a weightsForDisplay si NO es el usuario actual
      if (!isCurrentUser) {
        data.weightsForDisplay.push(response.weight);
        if (response.threshold && typeof response.threshold === 'string') {
          data.thresholds.push(response.threshold);
        }
        data.emails.push(email);
      }
    }

    // Calcular estadísticas para cada indicador
    const indicators = Array.from(indicatorMap.values()).map((data) => {
      // Sumar TODOS los pesos (incluyendo usuario actual) para el promedio
      const sumAllWeights = data.allWeights.reduce((sum, w) => sum + w, 0);
      // Calcular promedio usando el total de respondentes de la estrategia
      const average = totalRespondents > 0 ? sumAllWeights / totalRespondents : 0;

      return {
        indicatorId: data.indicatorId,
        indicatorName: data.indicatorName,
        indicatorDescription: data.indicatorDescription,
        weights: data.weightsForDisplay, // Solo pesos de otros (sin usuario actual)
        thresholds: data.thresholds,
        average: Math.round(average * 100) / 100,
        count: data.totalCount, // Conteo total incluyendo usuario actual
        totalRespondents,
      };
    });

    // Ordenar por promedio descendente
    indicators.sort((a, b) => b.average - a.average);

    return NextResponse.json({
      strategyId,
      totalRespondents,
      indicators,
    });
  } catch (error) {
    console.error("Error fetching consolidated responses:", error);
    return NextResponse.json(
      { error: "Failed to fetch consolidated responses" },
      { status: 500 }
    );
  }
}

