import { dbConnect } from "@/database/database";
import HomePageSection from "@/models/HomePageSection";
import { defaultHomeSections } from "@/utils/defaultHomeSections";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "true";

    const filter = includeInactive ? {} : { isActive: true };

    let sections = await HomePageSection.find(filter).sort({ order: 1, createdAt: 1 }).lean();

    // Auto-seed with default sections if empty
    if (!sections || sections.length === 0) {
      const count = await HomePageSection.countDocuments();
      if (count === 0) {
        await HomePageSection.insertMany(defaultHomeSections);
        sections = await HomePageSection.find(filter).sort({ order: 1, createdAt: 1 }).lean();
      }
    }

    return NextResponse.json({
      success: true,
      count: sections.length,
      data: sections,
    });
  } catch (error) {
    console.error("GET /api/homepage-sections error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch homepage sections",
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

