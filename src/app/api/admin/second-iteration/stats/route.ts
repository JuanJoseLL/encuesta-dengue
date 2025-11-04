import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/admin/second-iteration/stats?surveyId=...
 * Returns dashboard statistics for second iteration
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const surveyId = searchParams.get("surveyId");

  try {
    const where: { surveyId?: string } = {};
    if (surveyId) {
      where.surveyId = surveyId;
    }

    // Get all sessions that have second iteration responses
    const sessions = await prisma.responseSession.findMany({
      where,
      include: {
        survey: {
          include: {
            strategies: { where: { active: true } },
          },
        },
        secondIterationResponses: true,
      },
    });

    // Filter sessions that have at least one second iteration response
    const sessionsWithSecondIteration = sessions.filter(
      (s) => s.secondIterationResponses.length > 0
    );

    if (sessionsWithSecondIteration.length === 0) {
      return NextResponse.json({
        totalSessions: 0,
        completedSessions: 0,
        inProgressSessions: 0,
        completionRate: 0,
        averageProgress: 0,
        averageReviewedStrategies: 0,
        totalStrategies: 0,
        totalIndicators: await prisma.indicator.count({ where: { active: true } }),
      });
    }

    // Get total strategies (excluding skipped ones)
    const totalStrategies = sessionsWithSecondIteration[0]?.survey.strategies.length || 0;

    // Calculate progress for each session
    const sessionProgress = await Promise.all(
      sessionsWithSecondIteration.map(async (session) => {
        // Get skipped strategies from metadata
        const metadata = (session.metadata as any) || {};
        const skippedStrategies = metadata.skippedStrategies || [];
        const availableStrategies = totalStrategies - skippedStrategies.length;

        // Count reviewed strategies (those with reviewedAt not null)
        const reviewedStrategies = new Set<string>();
        session.secondIterationResponses.forEach((response) => {
          if (response.reviewedAt !== null && !response.excluded) {
            reviewedStrategies.add(response.strategyId);
          }
        });

        const reviewedCount = Array.from(reviewedStrategies).filter(
          (id) => !skippedStrategies.includes(id)
        ).length;

        const progress = availableStrategies > 0 ? reviewedCount / availableStrategies : 0;

        // Check if session is completed (all available strategies reviewed)
        const isCompleted = reviewedCount === availableStrategies && availableStrategies > 0;

        return {
          sessionId: session.id,
          reviewedCount,
          totalAvailable: availableStrategies,
          progress,
          isCompleted,
          status: session.status,
        };
      })
    );

    const completedSessions = sessionProgress.filter((p) => p.isCompleted).length;
    const inProgressSessions = sessionProgress.filter((p) => !p.isCompleted).length;
    const completionRate = (completedSessions / sessionsWithSecondIteration.length) * 100;

    // Calculate average progress
    const totalProgress = sessionProgress.reduce((sum, p) => sum + p.progress, 0);
    const averageProgress = totalProgress / sessionProgress.length;

    // Calculate average reviewed strategies
    const totalReviewed = sessionProgress.reduce((sum, p) => sum + p.reviewedCount, 0);
    const averageReviewedStrategies = totalReviewed / sessionProgress.length;

    // Get total indicators
    const totalIndicators = await prisma.indicator.count({ where: { active: true } });

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSessions = await prisma.responseSession.count({
      where: {
        ...where,
        secondIterationResponses: {
          some: {
            updatedAt: {
              gte: sevenDaysAgo,
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        totalSessions: sessionsWithSecondIteration.length,
        completedSessions,
        inProgressSessions,
        completionRate: Math.round(completionRate * 10) / 10,
        averageProgress: Math.round(averageProgress * 1000) / 1000,
        averageReviewedStrategies: Math.round(averageReviewedStrategies * 10) / 10,
        totalStrategies,
        totalIndicators,
        recentActivity: {
          newSessions: recentSessions,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching second iteration stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}

