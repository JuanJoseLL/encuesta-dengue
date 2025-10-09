import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/sessions/:id/summary
 * Returns a summary of all scenarios and their completion status
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
            scenario: true,
          },
          orderBy: {
            weight: "desc",
          },
        },
        survey: {
          include: {
            scenarios: {
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

    // Group responses by scenario
    const responsesByScenario = new Map<string, typeof session.responses>();

    for (const response of session.responses) {
      const scenarioId = response.scenarioId;
      const existing = responsesByScenario.get(scenarioId) || [];
      responsesByScenario.set(scenarioId, [...existing, response]);
    }

    // Build summary items
    const items = session.survey.scenarios.map((scenario) => {
      const scenarioResponses = responsesByScenario.get(scenario.id) || [];

      const totalWeight = scenarioResponses.reduce(
        (sum, r) => sum + r.weight,
        0
      );

      let status: "complete" | "incomplete" | "not-applicable";

      if (scenarioResponses.length === 0) {
        status = "not-applicable";
      } else if (Math.abs(totalWeight - 100) <= 0.01) {
        status = "complete";
      } else {
        status = "incomplete";
      }

      return {
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        scenarioDescription: scenario.description,
        scenarioOrder: scenario.order,
        status,
        totalWeight: Math.round(totalWeight * 100) / 100,
        indicatorCount: scenarioResponses.length,
        indicators: scenarioResponses.map((r) => ({
          indicatorId: r.indicator.id,
          indicatorName: r.indicator.name,
          weight: r.weight,
        })),
      };
    });

    // Calculate warnings
    const warnings = [];
    const incompleteCount = items.filter((i) => i.status === "incomplete").length;
    const notApplicableCount = items.filter((i) => i.status === "not-applicable").length;
    const completeCount = items.filter((i) => i.status === "complete").length;

    if (incompleteCount > 0) {
      warnings.push(
        `${incompleteCount} scenario${incompleteCount > 1 ? "s" : ""} with weights that don't sum to 100%`
      );
    }

    if (notApplicableCount === session.survey.scenarios.length) {
      warnings.push("No scenarios have been completed");
    }

    if (completeCount === 0 && notApplicableCount < session.survey.scenarios.length) {
      warnings.push("Please complete at least one scenario before submitting");
    }

    return NextResponse.json(
      {
        sessionId: session.id,
        progress: session.progress,
        status: session.status,
        items,
        warnings,
        stats: {
          total: session.survey.scenarios.length,
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
