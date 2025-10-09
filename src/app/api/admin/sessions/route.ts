import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/admin/sessions
 * Returns all sessions with respondent and progress information
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status"); // "draft" | "submitted"
  const surveyId = searchParams.get("surveyId");

  try {
    const where: {
      status?: string;
      surveyId?: string;
    } = {};

    if (status) {
      where.status = status;
    }

    if (surveyId) {
      where.surveyId = surveyId;
    }

    const sessions = await prisma.responseSession.findMany({
      where,
      include: {
        respondent: true,
        survey: {
          include: {
            scenarios: {
              where: { active: true },
            },
          },
        },
        responses: {
          include: {
            indicator: true,
            scenario: true,
          },
        },
        logs: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const sessionsWithStats = sessions.map((session) => {
      const totalScenarios = session.survey.scenarios.length;

      // Group responses by scenario and calculate totals
      const scenarioWeights = new Map<string, number>();
      session.responses.forEach((response) => {
        const current = scenarioWeights.get(response.scenarioId) || 0;
        scenarioWeights.set(response.scenarioId, current + response.weight);
      });

      // Count completed scenarios (sum = 100)
      let completedScenarios = 0;
      scenarioWeights.forEach((total) => {
        if (Math.abs(total - 100) <= 0.01) {
          completedScenarios++;
        }
      });

      const lastActivity = session.logs[0]?.timestamp || session.updatedAt;

      return {
        id: session.id,
        token: session.token,
        surveyId: session.surveyId,
        surveyTitle: session.survey.title,
        respondentId: session.respondentId,
        respondentName: session.respondent.name || "Anónimo",
        respondentEmail: session.respondent.email,
        respondentRole: session.respondent.role,
        respondentOrganization: session.respondent.organization,
        progress: session.progress,
        progressScenarios: completedScenarios,
        totalScenarios,
        status: session.status,
        startedAt: session.startedAt,
        updatedAt: session.updatedAt,
        completedAt: session.completedAt,
        lastActivity,
        totalResponses: session.responses.length,
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
    console.error("Error fetching admin sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
