import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/respondents/by-email?email=...
 * Get respondent info by email
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Email es requerido" },
      { status: 400 }
    );
  }

  try {
    const respondent = await prisma.respondent.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        invites: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            token: true,
            status: true,
            expiresAt: true,
          },
        },
      },
    });

    if (!respondent) {
      return NextResponse.json(
        { error: "No se encontró un participante con este correo electrónico" },
        { status: 404 }
      );
    }

    // Verificar que tenga un token activo
    const invite = respondent.invites[0];
    if (!invite) {
      return NextResponse.json(
        { error: "No tiene una invitación activa. Contacte al administrador." },
        { status: 404 }
      );
    }

    // Verificar que no esté expirado
    if (new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Su invitación ha expirado. Contacte al administrador." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      respondent: {
        id: respondent.id,
        name: respondent.name,
        email: respondent.email,
        role: respondent.role,
        token: invite.token,
      },
    });
  } catch (error) {
    console.error("Error getting respondent by email:", error);
    return NextResponse.json(
      { error: "Error al buscar el participante" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/respondents/by-email
 * Update respondent role by email (only if not set)
 */
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { email, role } = body;

  if (!email || !role) {
    return NextResponse.json(
      { error: "Email y role son requeridos" },
      { status: 400 }
    );
  }

  try {
    const respondent = await prisma.respondent.findUnique({
      where: { email },
      include: {
        invites: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!respondent) {
      return NextResponse.json(
        { error: "Participante no encontrado" },
        { status: 404 }
      );
    }

    // Solo permitir actualizar si el rol no está establecido
    if (respondent.role) {
      return NextResponse.json(
        { error: "El rol ya ha sido establecido y no se puede cambiar" },
        { status: 403 }
      );
    }

    // Actualizar el rol
    const updatedRespondent = await prisma.respondent.update({
      where: { id: respondent.id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      respondent: {
        ...updatedRespondent,
        token: respondent.invites[0]?.token,
      },
    });
  } catch (error) {
    console.error("Error updating respondent role:", error);
    return NextResponse.json(
      { error: "Error al actualizar el rol" },
      { status: 500 }
    );
  }
}

