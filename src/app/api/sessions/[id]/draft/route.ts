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
    const { strategyId, weights, currentStrategyId, autosave = true } = body;
    
    console.log("Draft save request:", { sessionId: id, strategyId, weightsCount: weights?.length });

    // Validate session exists and is not submitted
    const session = await prisma.responseSession.findUnique({
      where: { id },
      include: {
        survey: {
          include: {
            strategies: {
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

    // Permitir edición incluso si la encuesta ya fue enviada
    // El experto puede seguir modificando sus respuestas

    // Validate strategy belongs to survey
    const strategy = session.survey.strategies.find((s: any) => s.id === strategyId);
    if (!strategy) {
      return NextResponse.json(
        { error: "Invalid strategy for this survey" },
        { status: 400 }
      );
    }

    // Upsert responses (create or update)
    if (weights && weights.length > 0) {
      for (const {
        indicatorId,
        weight,
        threshold = null,
      } of weights) {
        await prisma.response.upsert({
          where: {
            sessionId_strategyId_indicatorId: {
              sessionId: id,
              strategyId,
              indicatorId,
            },
          },
          update: {
            weight,
            threshold,
          },
          create: {
            sessionId: id,
            strategyId,
            indicatorId,
            weight,
            threshold,
          },
        });
      }

      // Delete responses not in weights array (user removed indicators)
      const indicatorIds = weights.map((w: { indicatorId: string }) => w.indicatorId);
      await prisma.response.deleteMany({
        where: {
          sessionId: id,
          strategyId,
          indicatorId: {
            notIn: indicatorIds,
          },
        },
      });
    } else {
      // If no weights, delete all responses for this strategy
      await prisma.response.deleteMany({
        where: {
          sessionId: id,
          strategyId,
        },
      });
    }

    // Calculate progress (completed strategies / total strategies)
    const completedStrategies = await prisma.response.groupBy({
      by: ["strategyId"],
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

    const progress = completedStrategies.length / session.survey.strategies.length;

    // Update session
    const updatedSession = await prisma.responseSession.update({
      where: { id },
      data: {
        progress,
        currentStrategyId: currentStrategyId || strategy.id,
        updatedAt: new Date(),
      },
    });

    // Create log entry
    await prisma.sessionLog.create({
      data: {
        sessionId: id,
        event: autosave ? "autosave" : "strategy-exit",
        strategyId,
        payload: {
          weightsCount: weights?.length || 0,
          progress,
          timestamp: new Date().toISOString(),
        },
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
      { error: "Failed to save progress", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
