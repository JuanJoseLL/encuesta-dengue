import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/second-iteration/session/[sessionId]/strategy/[strategyId]
 * Obtiene las respuestas de segunda iteración del usuario para una estrategia
 * Si no existen, las inicializa copiando las respuestas originales
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string; strategyId: string }> }
) {
  try {
    const { sessionId, strategyId } = await params;

    // Verificar si ya existen respuestas de segunda iteración
    let secondIterationResponses = await prisma.secondIterationResponse.findMany({
      where: {
        sessionId,
        strategyId,
      },
    });

    // Si no existen, inicializar copiando las respuestas originales
    if (secondIterationResponses.length === 0) {
      const originalResponses = await prisma.response.findMany({
        where: {
          sessionId,
          strategyId,
        },
      });

      // Crear las respuestas de segunda iteración
      const createData = originalResponses.map((r) => ({
        sessionId,
        strategyId,
        indicatorId: r.indicatorId,
        weight: r.weight,
        threshold: r.threshold,
        excluded: false,
        isOriginal: true,
      }));

      if (createData.length > 0) {
        await prisma.secondIterationResponse.createMany({
          data: createData,
        });

        secondIterationResponses = await prisma.secondIterationResponse.findMany({
          where: {
            sessionId,
            strategyId,
          },
        });
      }
    }

    return NextResponse.json({
      sessionId,
      strategyId,
      responses: secondIterationResponses,
    });
  } catch (error) {
    console.error("Error fetching second iteration responses:", error);
    return NextResponse.json(
      { error: "Failed to fetch second iteration responses" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/second-iteration/session/[sessionId]/strategy/[strategyId]
 * Actualiza las respuestas de segunda iteración del usuario
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string; strategyId: string }> }
) {
  try {
    const { sessionId, strategyId } = await params;
    const body = await request.json();
    const { responses } = body;

    // Validar que responses sea un array
    if (!Array.isArray(responses)) {
      return NextResponse.json(
        { error: "Responses must be an array" },
        { status: 400 }
      );
    }

    // Actualizar o crear cada respuesta
    for (const response of responses) {
      const { indicatorId, weight, threshold, excluded, isOriginal } = response;

      await prisma.secondIterationResponse.upsert({
        where: {
          sessionId_strategyId_indicatorId: {
            sessionId,
            strategyId,
            indicatorId,
          },
        },
        update: {
          weight: weight ?? 0,
          threshold: threshold ?? null,
          excluded: excluded ?? false,
          updatedAt: new Date(),
        },
        create: {
          sessionId,
          strategyId,
          indicatorId,
          weight: weight ?? 0,
          threshold: threshold ?? null,
          excluded: excluded ?? false,
          isOriginal: isOriginal ?? false,
        },
      });
    }

    // Obtener las respuestas actualizadas
    const updatedResponses = await prisma.secondIterationResponse.findMany({
      where: {
        sessionId,
        strategyId,
      },
    });

    return NextResponse.json({
      sessionId,
      strategyId,
      responses: updatedResponses,
    });
  } catch (error) {
    console.error("Error updating second iteration responses:", error);
    return NextResponse.json(
      { error: "Failed to update second iteration responses" },
      { status: 500 }
    );
  }
}

