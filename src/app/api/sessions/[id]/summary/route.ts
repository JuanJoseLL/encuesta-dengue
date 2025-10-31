import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/sessions/:id/summary
 * Returns a summary of all strategies and their completion status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Load session with all responses
    const session = await prisma.responseSession.findUnique({
      where: { id },
      include: {
        responses: {
          include: {
            indicator: true,
            strategy: true,
          },
          orderBy: {
            weight: "desc",
          },
        },
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

    // Group responses by strategy
    const responsesByStrategy = new Map<string, typeof session.responses>();

    for (const response of session.responses) {
      const strategyId = response.strategyId;
      const existing = responsesByStrategy.get(strategyId) || [];
      responsesByStrategy.set(strategyId, [...existing, response]);
    }

    // Get skipped strategies and ratings from metadata
    const metadata = (session.metadata as any) || {};
    const skippedStrategies = metadata.skippedStrategies || [];
    const strategyRatings = metadata.strategyRatings || {};

    // Build summary items
    const items = session.survey.strategies.map((strategy: any) => {
      const strategyResponses = responsesByStrategy.get(strategy.id) || [];
      const isSkipped = skippedStrategies.includes(strategy.id);

      const totalWeight = strategyResponses.reduce(
        (sum: number, r: any) => sum + r.weight,
        0
      );

      let status: "complete" | "incomplete" | "not-applicable";
      let evaluationMode: "weighted" | "skipped" = isSkipped ? "skipped" : "weighted";

      if (isSkipped) {
        status = "complete"; // Skipped strategies are considered complete
      } else if (strategyResponses.length === 0) {
        status = "not-applicable";
      } else if (Math.abs(totalWeight - 100) <= 0.01) {
        status = "complete";
      } else {
        status = "incomplete";
      }

      return {
        strategyId: strategy.id,
        strategyMetodo: strategy.metodo,
        strategyDescription: strategy.description,
        strategyObjetivo: strategy.objetivo,
        strategyCodigo: strategy.codigo,
        strategyOrder: strategy.order,
        strategyAssociatedIndicators: strategy.associatedIndicators || [],
        status,
        evaluationMode,
        importanceRating: strategyRatings[strategy.id] ?? null,
        totalWeight: Math.round(totalWeight * 100) / 100,
        indicatorCount: strategyResponses.length,
        indicators: strategyResponses.map((r: any) => ({
          indicatorId: r.indicator.id,
          indicatorName: r.indicator.name,
          weight: r.weight,
          threshold: r.threshold,
        })),
      };
    });

    // Calculate warnings
    const warnings = [];
    const incompleteCount = items.filter((i: any) => i.status === "incomplete").length;
    const notApplicableCount = items.filter((i: any) => i.status === "not-applicable").length;
    const completeCount = items.filter((i: any) => i.status === "complete").length;

    if (incompleteCount > 0) {
      warnings.push(
        `${incompleteCount} strateg${incompleteCount > 1 ? "ies" : "y"} with weights that don't sum to 100%`
      );
    }

    if (notApplicableCount === session.survey.strategies.length) {
      warnings.push("No strategies have been completed");
    }

    if (completeCount === 0 && notApplicableCount < session.survey.strategies.length) {
      warnings.push("Please complete at least one strategy before submitting");
    }

    return NextResponse.json(
      {
        sessionId: session.id,
        progress: session.progress,
        status: session.status,
        items,
        warnings,
        stats: {
          total: session.survey.strategies.length,
          complete: completeCount,
          incomplete: incompleteCount,
          notApplicable: notApplicableCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
