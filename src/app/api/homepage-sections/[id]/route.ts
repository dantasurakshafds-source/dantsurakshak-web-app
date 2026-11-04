import { dbConnect } from "@/database/database";
import HomePageSection from "@/models/HomePageSection";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;

    let section = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      section = await HomePageSection.findById(id).lean();
    }
    if (!section) {
      section = await HomePageSection.findOne({ sectionKey: id.toLowerCase() }).lean();
    }

    if (!section) {
      return NextResponse.json(
        { success: false, message: "Homepage section not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: section,
    });
  } catch (error) {
    console.error("GET /api/homepage-sections/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch homepage section",
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    let filter: Record<string, unknown> = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      filter = { _id: id };
    } else {
      filter = { sectionKey: id.toLowerCase() };
    }

    const existing = await HomePageSection.findOne(filter);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Homepage section not found" },
        { status: 404 }
      );
    }

    // If changing sectionKey, ensure uniqueness
    if (body.sectionKey && body.sectionKey !== existing.sectionKey) {
      const formattedKey = String(body.sectionKey).trim().toLowerCase().replace(/\s+/g, "-");
      const duplicate = await HomePageSection.findOne({
        sectionKey: formattedKey,
        _id: { $ne: existing._id },
      });
      if (duplicate) {
        return NextResponse.json(
          { success: false, message: `Section key '${formattedKey}' is already in use` },
          { status: 409 }
        );
      }
      existing.sectionKey = formattedKey;
    }

    if (body.title !== undefined) existing.title = String(body.title).trim();
    if (body.subtitle !== undefined) existing.subtitle = String(body.subtitle).trim();
    if (body.description !== undefined) existing.description = String(body.description).trim();
    if (body.badge !== undefined) existing.badge = String(body.badge).trim();
    if (body.image !== undefined) existing.image = body.image;
    if (body.items !== undefined && Array.isArray(body.items)) existing.items = body.items;
    if (body.order !== undefined && typeof body.order === "number") existing.order = body.order;
    if (body.isActive !== undefined) existing.isActive = Boolean(body.isActive);

    await existing.save();

    return NextResponse.json({
      success: true,
      message: "Homepage section updated successfully",
      data: existing,
    });
  } catch (error) {
    console.error("PUT /api/homepage-sections/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update homepage section",
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;

    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await HomePageSection.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await HomePageSection.findOneAndDelete({ sectionKey: id.toLowerCase() });
    }

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Homepage section not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Homepage section deleted successfully",
      data: { id: deleted._id, sectionKey: deleted.sectionKey },
    });
  } catch (error) {
    console.error("DELETE /api/homepage-sections/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete homepage section",
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

