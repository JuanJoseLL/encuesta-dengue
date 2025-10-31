import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/admin/exports/excel?surveyId=...
 * Exports all responses as an Excel workbook
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
    const sessions = await prisma.responseSession.findMany({
      where: {
        surveyId,
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

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Sistema de Encuestas Dengue";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Respuestas");

    worksheet.columns = [
      { header: "Estado", key: "session_status", width: 16 },
      { header: "Respondent ID", key: "respondent_id", width: 18 },
      { header: "Nombre", key: "respondent_name", width: 24 },
      { header: "Email", key: "respondent_email", width: 30 },
      { header: "Rol", key: "respondent_role", width: 18 },
      { header: "Estrategia", key: "strategy_metodo", width: 32 },
      { header: "Orden Estrategia", key: "strategy_order", width: 18 },
      { header: "Calificación Importancia", key: "importance_rating", width: 24 },
      { header: "Indicador", key: "indicator_name", width: 32 },
      { header: "Dominio", key: "indicator_domain", width: 22 },
      { header: "Peso", key: "weight", width: 10 },
      { header: "Umbral", key: "threshold", width: 16 },
      { header: "Inicio Sesión", key: "session_started_at", width: 22 },
      { header: "Fin Sesión", key: "session_completed_at", width: 22 },
      { header: "Actualizado", key: "response_updated_at", width: 22 },
    ];

    worksheet.views = [{ state: "frozen", ySplit: 1 }];
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: worksheet.columnCount },
    };

    sessions.forEach((session) => {
      const isInProgress = session.status === "in_progress";
      const statusLabel = session.status === "submitted" ? "Completada" : "En Progreso";

      // Extract strategy ratings from metadata
      const metadata = (session.metadata as any) || {};
      const strategyRatings = metadata.strategyRatings || {};

      session.responses.forEach((response) => {
        // Get importance rating for this strategy
        const importanceRating = strategyRatings[response.strategyId] ?? null;

        const row = worksheet.addRow({
          session_status: statusLabel,
          respondent_id: session.respondentId,
          respondent_name: session.respondent?.name || "Anónimo",
          respondent_email: session.respondent?.email || "",
          respondent_role: session.respondent?.role ?? "",
          strategy_metodo: response.strategy.metodo,
          strategy_order: response.strategy.order ?? null,
          importance_rating: importanceRating !== null ? importanceRating : "",
          indicator_name: response.indicator.name,
          indicator_domain: response.indicator.domain || "",
          weight: response.weight ?? null,
          threshold: response.threshold ?? "",
          session_started_at: session.startedAt.toISOString(),
          session_completed_at: session.completedAt?.toISOString() ?? "",
          response_updated_at: response.updatedAt.toISOString(),
        });

        // Aplicar color de fondo amarillo claro para sesiones en progreso
        if (isInProgress) {
          row.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFFF9E6" }, // Amarillo claro
            };
          });
        }
      });
    });

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE2F0FB" },
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFB0C4DE" } },
        left: { style: "thin", color: { argb: "FFB0C4DE" } },
        bottom: { style: "thin", color: { argb: "FFB0C4DE" } },
        right: { style: "thin", color: { argb: "FFB0C4DE" } },
      };
    });

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;
      row.border = {
        left: { style: "dotted", color: { argb: "FFE6E6FA" } },
        right: { style: "dotted", color: { argb: "FFE6E6FA" } },
      };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const nodeBuffer = Buffer.from(buffer as ArrayBuffer);

    return new NextResponse(nodeBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="encuesta-dengue-${surveyId}-${new Date()
          .toISOString()
          .split("T")[0]}.xlsx"`,
        "Content-Length": nodeBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error exporting Excel:", error);
    return NextResponse.json({ error: "Failed to export Excel" }, { status: 500 });
  }
}
