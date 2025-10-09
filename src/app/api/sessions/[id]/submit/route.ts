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
            scenario: true,
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

    if (session.status === "submitted") {
      return NextResponse.json(
        { error: "Session already submitted" },
        { status: 400 }
      );
    }

    // Validate completeness
    const scenarioWeights = new Map<string, number>();

    for (const response of session.responses) {
      const current = scenarioWeights.get(response.scenarioId) || 0;
      scenarioWeights.set(response.scenarioId, current + response.weight);
    }

    const incompleteScenarios = [];

    for (const scenario of session.survey.scenarios) {
      const totalWeight = scenarioWeights.get(scenario.id) || 0;

      // Check if scenario is complete (sum = 100) or has no responses
      if (totalWeight > 0 && Math.abs(totalWeight - 100) > 0.01) {
        incompleteScenarios.push({
          id: scenario.id,
          title: scenario.title,
          totalWeight,
        });
      }
    }

    // If incomplete and user hasn't acknowledged, return error
    if (incompleteScenarios.length > 0 && !acknowledgeIncomplete) {
      return NextResponse.json(
        {
          error: "Some scenarios are incomplete",
          incompleteScenarios,
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
          ? JSON.stringify({
              notes,
              incompleteScenarios: incompleteScenarios.length,
              acknowledgedIncomplete: acknowledgeIncomplete,
            })
          : undefined,
      },
    });

    // Create submission log
    await prisma.sessionLog.create({
      data: {
        sessionId: id,
        event: "submit",
        payload: JSON.stringify({
          timestamp: new Date().toISOString(),
          totalScenarios: session.survey.scenarios.length,
          completedScenarios: session.survey.scenarios.length - incompleteScenarios.length,
          incompleteScenarios: incompleteScenarios.length,
          acknowledgedIncomplete: acknowledgeIncomplete,
        }),
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
        incompleteScenarios,
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
