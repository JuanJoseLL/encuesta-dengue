import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/surveys/:id
 * Returns complete survey definition with strategies and indicators
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        strategies: {
          where: { active: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }

    if (!survey.active) {
      return NextResponse.json(
        { error: "Survey is not active" },
        { status: 403 }
      );
    }

    // Get all active indicators
    const indicators = await prisma.indicator.findMany({
      where: { active: true },
      orderBy: [{ domain: "asc" }, { name: "asc" }],
    });

    // Tags are already native JSON with PostgreSQL
    const indicatorsWithParsedTags = indicators.map((indicator: any) => ({
      id: indicator.id,
      name: indicator.name,
      description: indicator.description,
      domain: indicator.domain,
      tags: indicator.tags || [],
    }));

    return NextResponse.json(
      {
        survey: {
          id: survey.id,
          title: survey.title,
          version: survey.version,
          active: survey.active,
        },
        strategies: survey.strategies.map((strategy: any) => ({
          id: strategy.id,
          title: strategy.title,
          description: strategy.description,
          order: strategy.order,
        })),
        indicators: indicatorsWithParsedTags,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching survey:", error);
    return NextResponse.json(
      { error: "Failed to fetch survey" },
      { status: 500 }
    );
  }
}
