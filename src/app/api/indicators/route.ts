import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/indicators?domain=...&search=...
 * Returns list of indicators with optional filtering
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const domain = searchParams.get("domain");
  const search = searchParams.get("search");
  const active = searchParams.get("active");

  try {
    const where: {
      active?: boolean;
      domain?: string;
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" };
        description?: { contains: string; mode: "insensitive" };
      }>;
    } = {};

    // Filter by active status
    if (active !== null) {
      where.active = active === "true";
    } else {
      where.active = true; // Default to active only
    }

    // Filter by domain
    if (domain && domain !== "all") {
      where.domain = domain;
    }

    // Search in name or description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const indicators = await prisma.indicator.findMany({
      where,
      orderBy: [{ domain: "asc" }, { name: "asc" }],
    });

    // Tags are already native JSON with PostgreSQL
    const indicatorsWithParsedTags = indicators.map((indicator: any) => ({
      ...indicator,
      tags: indicator.tags || [],
    }));

    return NextResponse.json(
      {
        indicators: indicatorsWithParsedTags,
        total: indicatorsWithParsedTags.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching indicators:", error);
    return NextResponse.json(
      { error: "Failed to fetch indicators" },
      { status: 500 }
    );
  }
}
