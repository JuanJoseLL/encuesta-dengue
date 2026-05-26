import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { isThirdIterationStrategy } from "@/domain/constants";

/**
 * GET /api/third-iteration/progress?sessionId=[sessionId]
 * Progreso de la tercera iteración para un usuario.
 * Solo se consideran las estrategias incluidas en la tercera iteración
 * (ver THIRD_ITERATION_STRATEGY_CODIGOS) y que el usuario no haya omitido.
 * Una estrategia se considera "revisada" si fue marcada explícitamente (reviewedAt).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

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
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Estrategias que participan en la tercera iteración
    const thirdIterationStrategies = session.survey.strategies.filter((s) =>
      isThirdIterationStrategy(s.codigo)
    );

    // Estrategias omitidas en la primera iteración (no se evaluaron)
    const metadata = (session.metadata as any) || {};
    const skippedStrategies: string[] = metadata.skippedStrategies || [];

    // Respuestas de la segunda iteración (punto de partida / comparación)
    const secondIterationResponses = await prisma.secondIterationResponse.findMany({
      where: { sessionId },
    });

    // Respuestas de la tercera iteración
    const thirdIterationResponses = await prisma.thirdIterationResponse.findMany({
      where: { sessionId },
    });

    const secondMap = new Map(
      secondIterationResponses.map((r) => [
        `${r.strategyId}-${r.indicatorId}`,
        { weight: r.weight },
      ])
    );

    // Conteo de indicadores disponibles por estrategia (desde la 2da iteración)
    const strategyIndicatorCounts = new Map<string, number>();
    for (const strategy of thirdIterationStrategies) {
      const distinctIndicators = await prisma.secondIterationResponse.findMany({
        where: { strategyId: strategy.id, excluded: false },
        select: { indicatorId: true },
        distinct: ["indicatorId"],
      });
      strategyIndicatorCounts.set(strategy.id, distinctIndicators.length);
    }

    const strategyStatuses = thirdIterationStrategies
      .filter((strategy) => !skippedStrategies.includes(strategy.id))
      .map((strategy) => {
        const strategyResponses = thirdIterationResponses.filter(
          (r) => r.strategyId === strategy.id && !r.excluded
        );

        const availableIndicatorCount = strategyIndicatorCounts.get(strategy.id) || 0;

        const totalWeight = strategyResponses.reduce((sum, r) => sum + r.weight, 0);

        let hasModifications = false;
        for (const response of strategyResponses) {
          const key = `${strategy.id}-${response.indicatorId}`;
          const previous = secondMap.get(key);
          if (previous && Math.abs(previous.weight - response.weight) > 0.01) {
            hasModifications = true;
          }
        }

        const hasReviewedAt = strategyResponses.some((r) => r.reviewedAt !== null);
        const isReviewed = hasReviewedAt;

        let status: "reviewed" | "modified" | "incomplete" | "not-started";
        if (isReviewed) {
          status = "reviewed";
        } else if (strategyResponses.length > 0 && hasModifications) {
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
          indicatorCount: availableIndicatorCount,
          hasModifications,
          isReviewed,
        };
      });

    const reviewedCount = strategyStatuses.filter((s) => s.status === "reviewed").length;
    const modifiedCount = strategyStatuses.filter((s) => s.status === "modified").length;
    const totalStrategies = strategyStatuses.length;
    const totalStrategiesInSurvey = thirdIterationStrategies.length;
    const progress = totalStrategies > 0 ? reviewedCount / totalStrategies : 0;

    return NextResponse.json({
      sessionId,
      totalStrategies,
      totalStrategiesInSurvey,
      skippedStrategiesCount: totalStrategiesInSurvey - totalStrategies,
      reviewedStrategies: reviewedCount,
      modifiedStrategies: modifiedCount,
      progress,
      strategies: strategyStatuses,
    });
  } catch (error) {
    console.error("Error fetching third iteration progress:", error);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}
