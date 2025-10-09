import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * PATCH /api/sessions/:id/draft
 * Saves draft progress (autosave)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { scenarioId, weights, currentScenarioId, autosave = true } = body;

    // Validate session exists and is not submitted
    const session = await prisma.responseSession.findUnique({
      where: { id },
      include: {
        survey: {
          include: {
            scenarios: {
              where: { active: true },
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

    if (session.status === "submitted") {
      return NextResponse.json(
        { error: "Cannot modify submitted session" },
        { status: 403 }
      );
    }

    // Validate scenario belongs to survey
    const scenario = session.survey.scenarios.find((s) => s.id === scenarioId);
    if (!scenario) {
      return NextResponse.json(
        { error: "Invalid scenario for this survey" },
        { status: 400 }
      );
    }

    // Validate weights sum to 100 (with small tolerance for floating point)
    if (weights && weights.length > 0) {
      const totalWeight = weights.reduce(
        (sum: number, w: { weight: number }) => sum + w.weight,
        0
      );

      if (Math.abs(totalWeight - 100) > 0.01 && totalWeight !== 0) {
        return NextResponse.json(
          {
            error: "Weights must sum to 100",
            totalWeight,
          },
          { status: 400 }
        );
      }
    }

    // Upsert responses (create or update)
    if (weights && weights.length > 0) {
      for (const { indicatorId, weight } of weights) {
        await prisma.response.upsert({
          where: {
            sessionId_scenarioId_indicatorId: {
              sessionId: id,
              scenarioId,
              indicatorId,
            },
          },
          update: {
            weight,
          },
          create: {
            sessionId: id,
            scenarioId,
            indicatorId,
            weight,
          },
        });
      }

      // Delete responses not in weights array (user removed indicators)
      const indicatorIds = weights.map((w: { indicatorId: string }) => w.indicatorId);
      await prisma.response.deleteMany({
        where: {
          sessionId: id,
          scenarioId,
          indicatorId: {
            notIn: indicatorIds,
          },
        },
      });
    } else {
      // If no weights, delete all responses for this scenario
      await prisma.response.deleteMany({
        where: {
          sessionId: id,
          scenarioId,
        },
      });
    }

    // Calculate progress (completed scenarios / total scenarios)
    const completedScenarios = await prisma.response.groupBy({
      by: ["scenarioId"],
      where: {
        sessionId: id,
      },
      _sum: {
        weight: true,
      },
      having: {
        weight: {
          _sum: {
            gte: 99.99, // Account for floating point
            lte: 100.01,
          },
        },
      },
    });

    const progress = completedScenarios.length / session.survey.scenarios.length;

    // Update session
    const updatedSession = await prisma.responseSession.update({
      where: { id },
      data: {
        progress,
        currentScenarioId: currentScenarioId || scenario.id,
        updatedAt: new Date(),
      },
    });

    // Create log entry
    await prisma.sessionLog.create({
      data: {
        sessionId: id,
        event: autosave ? "autosave" : "scenario-exit",
        scenarioId,
        payload: JSON.stringify({
          weightsCount: weights?.length || 0,
          progress,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json(
      {
        session: updatedSession,
        message: autosave ? "Progress saved automatically" : "Progress saved",
        progress,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving draft:", error);
    return NextResponse.json(
      { error: "Failed to save progress" },
      { status: 500 }
    );
  }
}
