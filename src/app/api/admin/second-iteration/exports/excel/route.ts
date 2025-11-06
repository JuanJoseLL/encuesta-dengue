import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/admin/second-iteration/exports/excel?surveyId=...
 * Exports all second iteration responses as an Excel workbook
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

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Sistema de Encuestas Dengue";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Respuestas Segunda Iteración");

    worksheet.columns = [
      { header: "Respondent ID", key: "respondent_id", width: 18 },
      { header: "Nombre", key: "respondent_name", width: 24 },
      { header: "Email", key: "respondent_email", width: 30 },
      { header: "Rol", key: "respondent_role", width: 18 },
      { header: "Estrategia", key: "strategy_metodo", width: 32 },
      { header: "Orden Estrategia", key: "strategy_order", width: 18 },
      { header: "Indicador", key: "indicator_name", width: 32 },
      { header: "Dominio", key: "indicator_domain", width: 22 },
      { header: "Peso", key: "weight", width: 10 },
      { header: "Umbral", key: "threshold", width: 16 },
      { header: "Es Original", key: "is_original", width: 14 },
      { header: "Revisado En", key: "reviewed_at", width: 22 },
      { header: "Actualizado", key: "response_updated_at", width: 22 },
    ];

    worksheet.views = [{ state: "frozen", ySplit: 1 }];
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: worksheet.columnCount },
    };

    sessions.forEach((session) => {
      session.secondIterationResponses.forEach((response) => {
        const strategy = strategyMap.get(response.strategyId);
        const indicator = indicatorMap.get(response.indicatorId);

        const row = worksheet.addRow({
          respondent_id: session.respondentId,
          respondent_name: session.respondent?.name || "Anónimo",
          respondent_email: session.respondent?.email || "",
          respondent_role: session.respondent?.role ?? "",
          strategy_metodo: strategy?.metodo ?? "",
          strategy_order: strategy?.order ?? null,
          indicator_name: indicator?.name ?? "",
          indicator_domain: indicator?.domain || "",
          weight: response.weight ?? null,
          threshold: response.threshold ?? "",
          is_original: response.isOriginal ? "Sí" : "No",
          reviewed_at: response.reviewedAt?.toISOString() ?? "",
          response_updated_at: response.updatedAt.toISOString(),
        });

        // Highlight reviewed responses
        if (response.reviewedAt) {
          row.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFE6F3E6" }, // Verde claro
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
        fgColor: { argb: "FFE2D0FB" }, // Morado claro
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
        "Content-Disposition": `attachment; filename="encuesta-dengue-iteracion-2-${surveyId}-${new Date()
          .toISOString()
          .split("T")[0]}.xlsx"`,
        "Content-Length": nodeBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error exporting second iteration Excel:", error);
    return NextResponse.json({ error: "Failed to export Excel" }, { status: 500 });
  }
}

