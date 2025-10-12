import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/respondents/:token
 * Get respondent info from token
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    const invite = await prisma.respondentInvite.findUnique({
      where: { token },
      include: {
        respondent: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!invite || !invite.respondent) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      respondent: invite.respondent,
    });
  } catch (error) {
    console.error("Error getting respondent:", error);
    return NextResponse.json(
      { error: "Error al obtener información del participante" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/respondents/:token
 * Update respondent role (only if not set)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json();
  const { role } = body;

  if (!role) {
    return NextResponse.json(
      { error: "Role es requerido" },
      { status: 400 }
    );
  }

  try {
    const invite = await prisma.respondentInvite.findUnique({
      where: { token },
      include: {
        respondent: true,
      },
    });

    if (!invite || !invite.respondent) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 404 }
      );
    }

    // Solo permitir actualizar si el rol no está establecido
    if (invite.respondent.role) {
      return NextResponse.json(
        { error: "El rol ya ha sido establecido y no se puede cambiar" },
        { status: 403 }
      );
    }

    // Actualizar el rol
    const updatedRespondent = await prisma.respondent.update({
      where: { id: invite.respondent.id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      respondent: updatedRespondent,
    });
  } catch (error) {
    console.error("Error updating respondent role:", error);
    return NextResponse.json(
      { error: "Error al actualizar el rol" },
      { status: 500 }
    );
  }
}

