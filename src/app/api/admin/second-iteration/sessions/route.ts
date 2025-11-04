import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/admin/second-iteration/sessions
 * Returns all sessions with second iteration progress information
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const surveyId = searchParams.get("surveyId");

  try {
    const where: {
      surveyId?: string;
    } = {};

    if (surveyId) {
      where.surveyId = surveyId;
    }

    const sessions = await prisma.responseSession.findMany({
      where,
      include: {
        respondent: true,
        survey: {
          include: {
            strategies: {
              where: { active: true },
            },
          },
        },
        secondIterationResponses: true,
        logs: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Filter and process sessions that have second iteration responses
    const sessionsWithStats = sessions
      .filter((session) => session.secondIterationResponses.length > 0)
      .map((session) => {
        const totalStrategies = session.survey.strategies.length;

        // Get skipped strategies from metadata
        const metadata = (session.metadata as any) || {};
        const skippedStrategies = metadata.skippedStrategies || [];
        const availableStrategies = totalStrategies - skippedStrategies.length;

        // Group responses by strategy and check if reviewed
        const strategyStatus = new Map<string, { reviewed: boolean; hasResponses: boolean }>();
        
        session.secondIterationResponses.forEach((response) => {
          if (!skippedStrategies.includes(response.strategyId)) {
            const current = strategyStatus.get(response.strategyId) || {
              reviewed: false,
              hasResponses: false,
            };
            current.hasResponses = true;
            if (response.reviewedAt !== null && !response.excluded) {
              current.reviewed = true;
            }
            strategyStatus.set(response.strategyId, current);
          }
        });

        // Count reviewed strategies
        let reviewedStrategies = 0;
        strategyStatus.forEach((status) => {
          if (status.reviewed) {
            reviewedStrategies++;
          }
        });

        const progress = availableStrategies > 0 ? reviewedStrategies / availableStrategies : 0;
        const isCompleted = reviewedStrategies === availableStrategies && availableStrategies > 0;

        // Get the most recent activity from second iteration responses only
        // Prioritize the most recent second iteration response update
        const mostRecentResponse = session.secondIterationResponses.length > 0
          ? session.secondIterationResponses
              .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0]
          : null;
        
        // Use only second iteration activity, not session logs which may include first iteration activity
        const lastActivity = mostRecentResponse?.updatedAt || session.updatedAt;

        return {
          id: session.id,
          token: session.token,
          surveyId: session.surveyId,
          surveyTitle: session.survey.title,
          respondentId: session.respondentId,
          respondentName: session.respondent.name || "Anónimo",
          respondentEmail: session.respondent.email,
          respondentRole: session.respondent.role,
          progress,
          reviewedStrategies,
          totalStrategies: availableStrategies,
          status: isCompleted ? "submitted" : "draft",
          startedAt: session.startedAt,
          updatedAt: session.updatedAt,
          completedAt: isCompleted ? session.updatedAt : null,
          lastActivity,
          totalResponses: session.secondIterationResponses.length,
        };
      });

    return NextResponse.json(
      {
        sessions: sessionsWithStats,
        total: sessionsWithStats.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching second iteration sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

