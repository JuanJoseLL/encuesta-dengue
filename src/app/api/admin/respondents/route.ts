import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/admin/respondents
 * Get all respondents with their invite status
 */
export async function GET(request: NextRequest) {
  try {
    const respondents = await prisma.respondent.findMany({
      include: {
        invites: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            sessions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      respondents: respondents.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        role: r.role,
        createdAt: r.createdAt,
        sessionCount: r._count.sessions,
        lastInvite: r.invites[0] || null,
      })),
    });
  } catch (error) {
    console.error("Error getting respondents:", error);
    return NextResponse.json(
      { error: "Error al obtener participantes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/respondents
 * Create a new respondent and generate invite token
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, surveyId } = body;

  if (!name || !email) {
    return NextResponse.json(
      { error: "Nombre y email son requeridos" },
      { status: 400 }
    );
  }

  if (!surveyId) {
    return NextResponse.json(
      { error: "surveyId es requerido" },
      { status: 400 }
    );
  }

  try {
    // Verificar si el email ya existe
    const existing = await prisma.respondent.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un participante con este email" },
        { status: 409 }
      );
    }

    // Crear respondent
    const respondent = await prisma.respondent.create({
      data: {
        name,
        email,
      },
    });

    // Generar token único
    const token = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    // Crear invite (expires in 90 days by default)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    const invite = await prisma.respondentInvite.create({
      data: {
        token,
        surveyId,
        respondentId: respondent.id,
        expiresAt,
        status: "pending",
      },
    });

    return NextResponse.json({
      respondent: {
        id: respondent.id,
        name: respondent.name,
        email: respondent.email,
      },
      invite: {
        token: invite.token,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error creating respondent:", error);
    return NextResponse.json(
      { error: "Error al crear participante" },
      { status: 500 }
    );
  }
}

