import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { isThirdIterationStrategy } from "@/domain/constants";

/**
 * GET /api/admin/third-iteration/sessions
 * Devuelve las sesiones con información de progreso de la tercera iteración.
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
        respondent: true,
        survey: {
          include: {
            strategies: { where: { active: true } },
          },
        },
        thirdIterationResponses: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    const sessionsWithStats = sessions
      .filter((session) => session.thirdIterationResponses.length > 0)
      .map((session) => {
        // Estrategias incluidas en la tercera iteración
        const thirdStrategies = session.survey.strategies.filter((s) =>
          isThirdIterationStrategy(s.codigo)
        );
        const totalStrategies = thirdStrategies.length;

        const metadata = (session.metadata as any) || {};
        const skippedStrategies: string[] = metadata.skippedStrategies || [];
        const availableStrategies =
          thirdStrategies.filter((s) => !skippedStrategies.includes(s.id)).length;

        const strategyStatus = new Map<string, { reviewed: boolean; hasResponses: boolean }>();

        session.thirdIterationResponses.forEach((response) => {
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

        let reviewedStrategies = 0;
        strategyStatus.forEach((status) => {
          if (status.reviewed) {
            reviewedStrategies++;
          }
        });

        const progress = availableStrategies > 0 ? reviewedStrategies / availableStrategies : 0;
        const isCompleted = reviewedStrategies === availableStrategies && availableStrategies > 0;

        const mostRecentResponse = session.thirdIterationResponses.length > 0
          ? session.thirdIterationResponses
              .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0]
          : null;

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
          totalResponses: session.thirdIterationResponses.length,
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
    console.error("Error fetching third iteration sessions:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}
