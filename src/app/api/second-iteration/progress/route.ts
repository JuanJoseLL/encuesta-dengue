import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/second-iteration/progress?sessionId=[sessionId]
 * Obtiene el progreso de la segunda iteración para un usuario
 * Una estrategia se considera "revisada" si:
 * 1. Los pesos suman 100% Y
 * 2. Se han modificado los pesos o umbrales respecto a la primera iteración
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    // Obtener la sesión con sus estrategias
    const session = await prisma.responseSession.findUnique({
      where: { id: sessionId },
      include: {
        survey: {
          include: {
            strategies: {
              where: { active: true },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Get skipped strategies from metadata (primera iteración)
    const metadata = (session.metadata as any) || {};
    const skippedStrategies = metadata.skippedStrategies || [];

    // Obtener respuestas originales (primera iteración)
    const originalResponses = await prisma.response.findMany({
      where: { sessionId },
    });

    // Obtener respuestas de segunda iteración
    const secondIterationResponses = await prisma.secondIterationResponse.findMany({
      where: { sessionId },
    });

    // Crear mapas para facilitar la búsqueda
    const originalMap = new Map(
      originalResponses.map((r) => [
        `${r.strategyId}-${r.indicatorId}`,
        { weight: r.weight, threshold: r.threshold },
      ])
    );

    const secondIterationMap = new Map(
      secondIterationResponses.map((r) => [
        `${r.strategyId}-${r.indicatorId}`,
        { weight: r.weight, threshold: r.threshold, excluded: r.excluded },
      ])
    );

    // Obtener indicadores consolidados para cada estrategia
    const strategyIndicatorCounts = new Map<string, number>();
    
    // Para cada estrategia, obtener el conteo de indicadores consolidados
    for (const strategy of session.survey.strategies) {
      // Obtener respuestas de todos los usuarios para esta estrategia
      const allResponses = await prisma.response.findMany({
        where: {
          strategyId: strategy.id,
          session: {
            status: "submitted",
          },
        },
        select: {
          indicatorId: true,
        },
        distinct: ['indicatorId'],
      });
      
      strategyIndicatorCounts.set(strategy.id, allResponses.length);
    }

    // Calcular el estado de cada estrategia
    // Filtrar estrategias que fueron skipped en la primera iteración
    const strategyStatuses = session.survey.strategies
      .filter((strategy) => !skippedStrategies.includes(strategy.id))
      .map((strategy) => {
      // Obtener respuestas de segunda iteración para esta estrategia
      const strategyResponses = secondIterationResponses.filter(
        (r) => r.strategyId === strategy.id && !r.excluded
      );

      // Obtener conteo de indicadores disponibles (desde primera iteración)
      const availableIndicatorCount = strategyIndicatorCounts.get(strategy.id) || 0;

      // Calcular total de pesos
      const totalWeight = strategyResponses.reduce(
        (sum, r) => sum + r.weight,
        0
      );

      // Verificar si los pesos suman 100%
      const weightsValid = Math.abs(totalWeight - 100) <= 0.01;

      // Verificar si se han hecho modificaciones
      let hasModifications = false;
      let hasThresholdModifications = false;

      for (const response of strategyResponses) {
        const originalKey = `${strategy.id}-${response.indicatorId}`;
        const original = originalMap.get(originalKey);

        if (original) {
          // Verificar si cambió el peso
          if (Math.abs(original.weight - response.weight) > 0.01) {
            hasModifications = true;
          }

          // Verificar si cambió el umbral
          const originalThreshold = original.threshold || "";
          const currentThreshold = response.threshold || "";
          if (originalThreshold !== currentThreshold) {
            hasThresholdModifications = true;
          }
        }
      }

      // Verificar si la estrategia fue explícitamente marcada como revisada
      const hasReviewedAt = strategyResponses.some(r => r.reviewedAt !== null);

      // Una estrategia se considera "revisada" SOLO si:
      // Fue explícitamente marcada como revisada (reviewedAt no es null)
      const isReviewed = hasReviewedAt;

      // Determinar el status
      let status: "reviewed" | "modified" | "incomplete" | "not-started";
      if (isReviewed) {
        status = "reviewed";
      } else if (strategyResponses.length > 0 && (hasModifications || hasThresholdModifications)) {
        status = "modified";
      } else if (strategyResponses.length > 0) {
        status = "incomplete";
      } else {
        status = "not-started";
      }

      return {
        strategyId: strategy.id,
        strategyMetodo: strategy.metodo,
        strategyDescription: strategy.description,
        strategyObjetivo: strategy.objetivo,
        strategyCodigo: strategy.codigo,
        strategyOrder: strategy.order,
        status,
        totalWeight: Math.round(totalWeight * 100) / 100,
        indicatorCount: availableIndicatorCount, // Usar conteo de indicadores disponibles
        hasModifications,
        hasThresholdModifications,
        isReviewed,
      };
    });

    // Calcular progreso general
    const reviewedCount = strategyStatuses.filter((s) => s.status === "reviewed").length;
    const modifiedCount = strategyStatuses.filter((s) => s.status === "modified").length;
    const totalStrategies = strategyStatuses.length;
    const totalStrategiesInSurvey = session.survey.strategies.length;
    const progress = totalStrategies > 0 ? reviewedCount / totalStrategies : 0;

    return NextResponse.json({
      sessionId,
      totalStrategies,
      totalStrategiesInSurvey,
      skippedStrategiesCount: skippedStrategies.length,
      reviewedStrategies: reviewedCount,
      modifiedStrategies: modifiedCount,
      progress,
      strategies: strategyStatuses,
    });
  } catch (error) {
    console.error("Error fetching second iteration progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}
