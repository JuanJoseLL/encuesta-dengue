import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/admin/exports/csv?surveyId=...
 * Exports all responses as CSV
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const surveyId = searchParams.get("surveyId");

  if (!surveyId) {
    return NextResponse.json(
      { error: "surveyId is required" },
      { status: 400 }
    );
  }

  try {
    // Get all submitted sessions for the survey
    const sessions = await prisma.responseSession.findMany({
      where: {
        surveyId,
        status: "submitted", // Only export completed sessions
      },
      include: {
        respondent: true,
        responses: {
          include: {
            strategy: true,
            indicator: true,
          },
          orderBy: [
            { strategyId: "asc" },
            { indicatorId: "asc" },
          ],
        },
      },
    });

    // Build CSV
    const headers = [
      "respondent_id",
      "respondent_name",
      "respondent_role",
      "respondent_organization",
      "session_id",
      "strategy_id",
      "strategy_title",
      "strategy_order",
      "indicator_id",
      "indicator_name",
      "indicator_domain",
      "weight",
      "session_started_at",
      "session_completed_at",
      "response_updated_at",
    ];

    const rows: string[][] = [];

    sessions.forEach((session: any) => {
      session.responses.forEach((response: any) => {
        rows.push([
          session.respondentId,
          session.respondent.name || "Anónimo",
          session.respondent.role,
          session.respondent.organization || "",
          session.id,
          response.strategyId,
          response.strategy.title,
          response.strategy.order.toString(),
          response.indicatorId,
          response.indicator.name,
          response.indicator.domain || "",
          response.weight.toString(),
          session.startedAt.toISOString(),
          session.completedAt?.toISOString() || "",
          response.updatedAt.toISOString(),
        ]);
      });
    });

    // Convert to CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map((row: any) =>
        row.map((cell: any) => {
          // Escape cells containing commas or quotes
          if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        }).join(",")
      ),
    ].join("\n");

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="encuesta-dengue-${surveyId}-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting CSV:", error);
    return NextResponse.json(
      { error: "Failed to export CSV" },
      { status: 500 }
    );
  }
}
