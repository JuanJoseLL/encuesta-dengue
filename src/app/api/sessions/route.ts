import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/sessions?token=xxx
 * Loads or creates a session by token
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Token is required" },
      { status: 400 }
    );
  }

  try {
    // Check if session already exists
    let session = await prisma.responseSession.findUnique({
      where: { token },
      include: {
        responses: {
          include: {
            indicator: true,
            strategy: true,
          },
        },
        logs: {
          orderBy: { timestamp: "desc" },
          take: 10,
        },
        survey: {
          include: {
            strategies: {
              where: { active: true },
              orderBy: { order: "asc" },
            },
          },
        },
        respondent: true,
      },
    });

    // If session doesn't exist, check invite token
    if (!session) {
      const invite = await prisma.respondentInvite.findUnique({
        where: { token },
      });

      if (!invite) {
        return NextResponse.json(
          { error: "Invalid token" },
          { status: 404 }
        );
      }

      // Check if token is expired
      if (new Date() > new Date(invite.expiresAt)) {
        return NextResponse.json(
          { error: "Token has expired" },
          { status: 410 }
        );
      }

      // Check if invite status allows access
      if (!["pending", "sent", "accepted"].includes(invite.status)) {
        return NextResponse.json(
          { error: "Invalid invite status" },
          { status: 403 }
        );
      }

      // Create respondent if doesn't exist
      let respondent;
      if (invite.respondentId) {
        respondent = await prisma.respondent.findUnique({
          where: { id: invite.respondentId },
        });
      }

      if (!respondent) {
        respondent = await prisma.respondent.create({
          data: {
            role: "participant", // Will be updated on first access
          },
        });

        // Update invite with respondent
        await prisma.respondentInvite.update({
          where: { id: invite.id },
          data: {
            respondentId: respondent.id,
            status: "accepted",
          },
        });
      }

      // Create new session
      session = await prisma.responseSession.create({
        data: {
          surveyId: invite.surveyId,
          respondentId: respondent.id,
          token,
          progress: 0,
          status: "draft",
          logs: {
            create: {
              event: "resume",
              payload: { message: "Session created" },
            },
          },
        },
        include: {
          responses: {
            include: {
              indicator: true,
              strategy: true,
            },
          },
          logs: {
            orderBy: { timestamp: "desc" },
            take: 10,
          },
          survey: {
            include: {
              strategies: {
                where: { active: true },
                orderBy: { order: "asc" },
              },
            },
          },
          respondent: true,
        },
      });
    }

    // Check if already submitted
    if (session.status === "submitted") {
      return NextResponse.json(
        {
          session,
          message: "Session already submitted",
          alreadySubmitted: true,
        },
        { status: 200 }
      );
    }

    // Log resume event if not first access
    if (session.logs.length > 0 && session.logs[0].event !== "resume") {
      await prisma.sessionLog.create({
        data: {
          sessionId: session.id,
          event: "resume",
          payload: { timestamp: new Date().toISOString() },
        },
      });
    }

    return NextResponse.json(
      {
        session,
        message: "Session loaded successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error loading session:", error);
    return NextResponse.json(
      { error: "Failed to load session" },
      { status: 500 }
    );
  }
}
