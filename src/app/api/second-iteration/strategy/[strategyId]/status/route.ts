import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ strategyId: string }> }
) {
  try {
    const { strategyId } = await params;

    // Obtener la sesión del usuario desde el token
    const token = request.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 400 });
    }

    const session = await prisma.responseSession.findFirst({
      where: { token },
      include: {
        survey: {
          include: {
            strategies: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }

    // Obtener respuestas originales del usuario para esta estrategia
    const originalResponses = await prisma.response.findMany({
      where: {
        sessionId: session.id,
        strategyId: strategyId,
      },
    });

    // Obtener respuestas de segunda iteración del usuario para esta estrategia
    const secondIterationResponses = await prisma.secondIterationResponse.findMany({
      where: {
        sessionId: session.id,
        strategyId: strategyId,
      },
    });

    // Si no hay respuestas de segunda iteración, no está revisada
    if (secondIterationResponses.length === 0) {
      return NextResponse.json({ isReviewed: false });
    }

    // Verificar si los pesos suman 100%
    const totalWeight = secondIterationResponses.reduce(
      (sum, r) => sum + r.weight,
      0
    );
    const weightsValid = Math.abs(totalWeight - 100) < 0.01;

    // Verificar si hay modificaciones comparando con las respuestas originales
    let hasModifications = false;
    let hasThresholdModifications = false;

    for (const secondResp of secondIterationResponses) {
      const originalResp = originalResponses.find(
        (r) => r.indicatorId === secondResp.indicatorId
      );

      if (originalResp) {
        // Verificar cambios en peso
        const weightChanged = Math.abs(originalResp.weight - secondResp.weight) > 0.01;
        if (weightChanged) {
          hasModifications = true;
        }

        // Verificar cambios en umbral
        const originalThreshold = originalResp.threshold || "";
        const secondThreshold = secondResp.threshold || "";
        const thresholdChanged = originalThreshold !== secondThreshold;
        if (thresholdChanged) {
          hasThresholdModifications = true;
        }
      } else {
        // Es un indicador nuevo (no estaba en las respuestas originales)
        hasModifications = true;
      }
    }

    // Una estrategia se considera "revisada" si:
    // 1. Los pesos son válidos (suman 100%) Y
    // 2. Se han hecho modificaciones (pesos o umbrales)
    const isReviewed = weightsValid && (hasModifications || hasThresholdModifications);

    return NextResponse.json({ isReviewed });
  } catch (error) {
    console.error("Error checking strategy status:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
