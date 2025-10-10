import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * POST /api/sessions/:id/submit
 * Submits the session and marks it as complete
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { acknowledgeIncomplete = false, notes } = body;

    // Load session with all data
    const session = await prisma.responseSession.findUnique({
      where: { id },
      include: {
        responses: {
          include: {
            strategy: true,
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

    if (session.status === "submitted") {
      return NextResponse.json(
        { error: "Session already submitted" },
        { status: 400 }
      );
    }

    // Validate completeness
    const strategyWeights = new Map<string, number>();

    for (const response of session.responses) {
      const current = strategyWeights.get(response.strategyId) || 0;
      strategyWeights.set(response.strategyId, current + response.weight);
    }

    const incompleteStrategies = [];

    for (const strategy of session.survey.strategies) {
      const totalWeight = strategyWeights.get(strategy.id) || 0;

      // Check if strategy is complete (sum = 100) or has no responses
      if (totalWeight > 0 && Math.abs(totalWeight - 100) > 0.01) {
        incompleteStrategies.push({
          id: strategy.id,
          title: strategy.title,
          totalWeight,
        });
      }
    }

    // If incomplete and user hasn't acknowledged, return error
    if (incompleteStrategies.length > 0 && !acknowledgeIncomplete) {
      return NextResponse.json(
        {
          error: "Some strategies are incomplete",
          incompleteStrategies,
          requiresAcknowledgment: true,
        },
        { status: 400 }
      );
    }

    // Update session to submitted
    const updatedSession = await prisma.responseSession.update({
      where: { id },
      data: {
        status: "submitted",
        completedAt: new Date(),
        progress: 1.0,
        metadata: notes
          ? {
              notes,
              incompleteStrategies: incompleteStrategies.length,
              acknowledgedIncomplete: acknowledgeIncomplete,
            }
          : undefined,
      },
    });

    // Create submission log
    await prisma.sessionLog.create({
      data: {
        sessionId: id,
        event: "submit",
        payload: {
          timestamp: new Date().toISOString(),
          totalStrategies: session.survey.strategies.length,
          completedStrategies: session.survey.strategies.length - incompleteStrategies.length,
          incompleteStrategies: incompleteStrategies.length,
          acknowledgedIncomplete: acknowledgeIncomplete,
        },
      },
    });

    // Update invite status if exists
    await prisma.respondentInvite.updateMany({
      where: {
        token: session.token,
      },
      data: {
        status: "completed",
      },
    });

    return NextResponse.json(
      {
        session: updatedSession,
        message: "Survey submitted successfully",
        incompleteStrategies,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting session:", error);
    return NextResponse.json(
      { error: "Failed to submit survey" },
      { status: 500 }
    );
  }
}
