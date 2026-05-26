import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/admin/third-iteration/exports/csv?surveyId=...
 * Exporta todas las respuestas de la tercera iteración como CSV (sin umbrales).
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const surveyId = searchParams.get("surveyId");

  if (!surveyId) {
    return NextResponse.json({ error: "surveyId is required" }, { status: 400 });
  }

  try {
    const sessions = await prisma.responseSession.findMany({
      where: { surveyId },
      include: {
        respondent: true,
        thirdIterationResponses: {
          where: { excluded: false },
          orderBy: [{ strategyId: "asc" }, { indicatorId: "asc" }],
        },
      },
    });

    const strategies = await prisma.strategy.findMany({
      where: { surveyId, active: true },
    });

    const indicators = await prisma.indicator.findMany({
      where: { active: true },
    });

    const strategyMap = new Map(strategies.map((s) => [s.id, s]));
    const indicatorMap = new Map(indicators.map((i) => [i.id, i]));

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
      "is_original",
      "excluded",
      "reviewed_at",
      "response_updated_at",
    ];

    const rows: string[][] = [];

    sessions.forEach((session) => {
      session.thirdIterationResponses.forEach((response) => {
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
          response.isOriginal ? "Sí" : "No",
          response.excluded ? "Sí" : "No",
          response.reviewedAt?.toISOString() || "",
          response.updatedAt.toISOString(),
        ]);
      });
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row: any) =>
        row.map((cell: any) => {
          if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        }).join(",")
      ),
    ].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="encuesta-dengue-iteracion-3-${surveyId}-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting third iteration CSV:", error);
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 });
  }
}
