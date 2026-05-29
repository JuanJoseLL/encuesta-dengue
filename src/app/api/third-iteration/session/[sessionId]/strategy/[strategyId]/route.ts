import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { isThirdIterationIndicator } from "@/domain/constants";

/**
 * GET /api/third-iteration/session/[sessionId]/strategy/[strategyId]
 * Obtiene las respuestas de tercera iteración del usuario para una estrategia.
 * Si no existen, las inicializa copiando los pesos de la SEGUNDA iteración
 * (la tercera iteración parte del consenso alcanzado en la segunda).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string; strategyId: string }> }
) {
  try {
    const { sessionId, strategyId } = await params;

    // ¿Ya existen respuestas de tercera iteración?
    let thirdIterationResponses = await prisma.thirdIterationResponse.findMany({
      where: { sessionId, strategyId },
    });

    // Si no existen, inicializar copiando los pesos de la segunda iteración
    if (thirdIterationResponses.length === 0) {
      const secondIterationResponses = await prisma.secondIterationResponse.findMany({
        where: { sessionId, strategyId, excluded: false },
      });

      const createData = secondIterationResponses
        // La tercera iteración solo trabaja un subconjunto de indicadores.
        .filter((r) => isThirdIterationIndicator(r.indicatorId))
        .map((r) => ({
          sessionId,
          strategyId,
          indicatorId: r.indicatorId,
          weight: r.weight,
          excluded: false,
          isOriginal: true, // proviene de la respuesta del propio usuario en la 2da iteración
        }));

      if (createData.length > 0) {
        await prisma.thirdIterationResponse.createMany({ data: createData });

        thirdIterationResponses = await prisma.thirdIterationResponse.findMany({
          where: { sessionId, strategyId },
        });
      }
    }

    return NextResponse.json({
      sessionId,
      strategyId,
      responses: thirdIterationResponses,
    });
  } catch (error) {
    console.error("Error fetching third iteration responses:", error);
    return NextResponse.json(
      { error: "Failed to fetch third iteration responses" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/third-iteration/session/[sessionId]/strategy/[strategyId]
 * Actualiza las respuestas de tercera iteración del usuario (solo pesos).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string; strategyId: string }> }
) {
  try {
    const { sessionId, strategyId } = await params;
    const body = await request.json();
    const { responses, markAsReviewed } = body;

    if (!Array.isArray(responses)) {
      return NextResponse.json(
        { error: "Responses must be an array" },
        { status: 400 }
      );
    }

    for (const response of responses) {
      const { indicatorId, weight, excluded, isOriginal } = response;

      const updateData: any = {
        weight: weight ?? 0,
        excluded: excluded ?? false,
        updatedAt: new Date(),
      };

      if (markAsReviewed) {
        updateData.reviewedAt = new Date();
      }

      const createData: any = {
        sessionId,
        strategyId,
        indicatorId,
        weight: weight ?? 0,
        excluded: excluded ?? false,
        isOriginal: isOriginal ?? false,
        reviewedAt: markAsReviewed ? new Date() : null,
      };

      await prisma.thirdIterationResponse.upsert({
        where: {
          sessionId_strategyId_indicatorId: {
            sessionId,
            strategyId,
            indicatorId,
          },
        },
        update: updateData,
        create: createData,
      });
    }

    const updatedResponses = await prisma.thirdIterationResponse.findMany({
      where: { sessionId, strategyId },
    });

    return NextResponse.json({
      sessionId,
      strategyId,
      responses: updatedResponses,
    });
  } catch (error) {
    console.error("Error updating third iteration responses:", error);
    return NextResponse.json(
      { error: "Failed to update third iteration responses" },
      { status: 500 }
    );
  }
}
