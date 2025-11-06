import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/admin/second-iteration/exports/csv?surveyId=...
 * Exports all second iteration responses as CSV
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
    // Get all sessions with second iteration responses
    const sessions = await prisma.responseSession.findMany({
      where: {
        surveyId,
      },
      include: {
        respondent: true,
        secondIterationResponses: {
          where: {
            excluded: false, // Only non-excluded responses
          },
          orderBy: [
            { strategyId: "asc" },
            { indicatorId: "asc" },
          ],
        },
      },
    });

    // Get strategies and indicators for mapping
    const strategies = await prisma.strategy.findMany({
      where: {
        surveyId,
        active: true,
      },
    });

    const indicators = await prisma.indicator.findMany({
      where: {
        active: true,
      },
    });

    const strategyMap = new Map(strategies.map((s) => [s.id, s]));
    const indicatorMap = new Map(indicators.map((i) => [i.id, i]));

    // Build CSV
    const headers = [
      "respondent_id",
      "respondent_name",
      "respondent_email",
      "respondent_role",
      "strategy_title",
      "strategy_order",
      "indicator_name",
      "indicator_domain",
      "weight",
      "threshold",
      "is_original",
      "excluded",
      "reviewed_at",
      "response_updated_at",
    ];

    const rows: string[][] = [];

    sessions.forEach((session) => {
      session.secondIterationResponses.forEach((response) => {
        const strategy = strategyMap.get(response.strategyId);
        const indicator = indicatorMap.get(response.indicatorId);

        rows.push([
          session.respondentId,
          session.respondent?.name || "Anónimo",
          session.respondent?.email || "",
          session.respondent?.role ?? "",
          strategy?.metodo ?? "",
          strategy?.order != null ? strategy.order.toString() : "",
          indicator?.name ?? "",
          indicator?.domain || "",
          response.weight != null ? response.weight.toString() : "",
          response.threshold ?? "",
          response.isOriginal ? "Sí" : "No",
          response.excluded ? "Sí" : "No",
          response.reviewedAt?.toISOString() || "",
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
        "Content-Disposition": `attachment; filename="encuesta-dengue-iteracion-2-${surveyId}-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting second iteration CSV:", error);
    return NextResponse.json(
      { error: "Failed to export CSV" },
      { status: 500 }
    );
  }
}

