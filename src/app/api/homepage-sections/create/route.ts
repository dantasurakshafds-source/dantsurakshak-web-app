import { dbConnect } from "@/database/database";
import HomePageSection from "@/models/HomePageSection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const { sectionKey, title, subtitle, description, badge, image, items, order, isActive } = body;

    if (!sectionKey || !title) {
      return NextResponse.json(
        { success: false, message: "sectionKey and title are required" },
        { status: 400 }
      );
    }

    const formattedKey = String(sectionKey).trim().toLowerCase().replace(/\s+/g, "-");

    const existing = await HomePageSection.findOne({ sectionKey: formattedKey });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `A section with key '${formattedKey}' already exists` },
        { status: 409 }
      );
    }

    const newSection = await HomePageSection.create({
      sectionKey: formattedKey,
      title: String(title).trim(),
      subtitle: subtitle ? String(subtitle).trim() : "",
      description: description ? String(description).trim() : "",
      badge: badge ? String(badge).trim() : "",
      image: image || "",
      items: Array.isArray(items) ? items : [],
      order: typeof order === "number" ? order : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Homepage section created successfully",
        data: newSection,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/homepage-sections/create error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create homepage section",
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

