import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { isThirdIterationStrategy } from "@/domain/constants";

/**
 * GET /api/admin/third-iteration/stats?surveyId=...
 * Estadísticas de dashboard para la tercera iteración.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const surveyId = searchParams.get("surveyId");

  try {
    const where: { surveyId?: string } = {};
    if (surveyId) {
      where.surveyId = surveyId;
    }

    const sessions = await prisma.responseSession.findMany({
      where,
      include: {
        survey: {
          include: {
            strategies: { where: { active: true } },
          },
        },
        thirdIterationResponses: true,
      },
    });

    const sessionsWithThirdIteration = sessions.filter(
      (s) => s.thirdIterationResponses.length > 0
    );

    const totalStrategies =
      sessionsWithThirdIteration[0]?.survey.strategies.filter((s) =>
        isThirdIterationStrategy(s.codigo)
      ).length || 0;

    if (sessionsWithThirdIteration.length === 0) {
      return NextResponse.json({
        totalSessions: 0,
        completedSessions: 0,
        inProgressSessions: 0,
        completionRate: 0,
        averageProgress: 0,
        averageReviewedStrategies: 0,
        totalStrategies,
        totalIndicators: await prisma.indicator.count({ where: { active: true } }),
      });
    }

    const sessionProgress = sessionsWithThirdIteration.map((session) => {
      const thirdStrategies = session.survey.strategies.filter((s) =>
        isThirdIterationStrategy(s.codigo)
      );

      const metadata = (session.metadata as any) || {};
      const skippedStrategies: string[] = metadata.skippedStrategies || [];
      const availableStrategies =
        thirdStrategies.filter((s) => !skippedStrategies.includes(s.id)).length;

      const reviewedStrategies = new Set<string>();
      session.thirdIterationResponses.forEach((response) => {
        if (response.reviewedAt !== null && !response.excluded) {
          reviewedStrategies.add(response.strategyId);
        }
      });

      const reviewedCount = Array.from(reviewedStrategies).filter(
        (id) => !skippedStrategies.includes(id)
      ).length;

      const progress = availableStrategies > 0 ? reviewedCount / availableStrategies : 0;
      const isCompleted = reviewedCount === availableStrategies && availableStrategies > 0;

      return { reviewedCount, availableStrategies, progress, isCompleted };
    });

    const completedSessions = sessionProgress.filter((p) => p.isCompleted).length;
    const inProgressSessions = sessionProgress.filter((p) => !p.isCompleted).length;
    const completionRate = (completedSessions / sessionsWithThirdIteration.length) * 100;

    const totalProgress = sessionProgress.reduce((sum, p) => sum + p.progress, 0);
    const averageProgress = totalProgress / sessionProgress.length;

    const totalReviewed = sessionProgress.reduce((sum, p) => sum + p.reviewedCount, 0);
    const averageReviewedStrategies = totalReviewed / sessionProgress.length;

    const totalIndicators = await prisma.indicator.count({ where: { active: true } });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSessions = await prisma.responseSession.count({
      where: {
        ...where,
        thirdIterationResponses: {
          some: { updatedAt: { gte: sevenDaysAgo } },
        },
      },
    });

    return NextResponse.json(
      {
        totalSessions: sessionsWithThirdIteration.length,
        completedSessions,
        inProgressSessions,
        completionRate: Math.round(completionRate * 10) / 10,
        averageProgress: Math.round(averageProgress * 1000) / 1000,
        averageReviewedStrategies: Math.round(averageReviewedStrategies * 10) / 10,
        totalStrategies,
        totalIndicators,
        recentActivity: { newSessions: recentSessions },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching third iteration stats:", error);
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}
