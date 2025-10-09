import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/admin/stats?surveyId=...
 * Returns dashboard statistics for admin
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const surveyId = searchParams.get("surveyId");

  try {
    const where: { surveyId?: string } = {};
    if (surveyId) {
      where.surveyId = surveyId;
    }

    // Get all sessions
    const sessions = await prisma.responseSession.findMany({
      where,
      include: {
        survey: {
          include: {
            scenarios: { where: { active: true } },
          },
        },
        responses: true,
      },
    });

    if (sessions.length === 0) {
      return NextResponse.json({
        totalSessions: 0,
        completedSessions: 0,
        inProgressSessions: 0,
        completionRate: 0,
        averageProgress: 0,
        totalScenarios: 0,
        totalIndicators: await prisma.indicator.count({ where: { active: true } }),
      });
    }

    const completedSessions = sessions.filter((s) => s.status === "submitted").length;
    const inProgressSessions = sessions.filter((s) => s.status === "draft").length;
    const completionRate = (completedSessions / sessions.length) * 100;

    // Calculate average progress across all sessions
    const totalProgress = sessions.reduce((sum, s) => sum + s.progress, 0);
    const averageProgress = totalProgress / sessions.length;

    // Get total scenarios from first session's survey
    const totalScenarios = sessions[0]?.survey.scenarios.length || 0;

    // Calculate average scenarios completed
    const averageCompletedScenarios = averageProgress * totalScenarios;

    // Get total indicators
    const totalIndicators = await prisma.indicator.count({ where: { active: true } });

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSessions = await prisma.responseSession.count({
      where: {
        ...where,
        startedAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    const recentCompletions = await prisma.responseSession.count({
      where: {
        ...where,
        completedAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    return NextResponse.json(
      {
        totalSessions: sessions.length,
        completedSessions,
        inProgressSessions,
        completionRate: Math.round(completionRate * 10) / 10,
        averageProgress: Math.round(averageProgress * 1000) / 1000,
        averageCompletedScenarios: Math.round(averageCompletedScenarios * 10) / 10,
        totalScenarios,
        totalIndicators,
        recentActivity: {
          newSessions: recentSessions,
          completedSessions: recentCompletions,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
