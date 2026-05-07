import { dbConnect } from "@/database/database";
import TextSlider from "@/models/TextSlider";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const formData = await request.formData();
    const sliderTextJson = formData.get("slider_text")?.toString();
    if (!sliderTextJson) {
      return NextResponse.json(
        { success: false, message: "Missing slider_text field" },
        { status: 400 }
      );
    }
    let slider_text;
    try {
      slider_text = JSON.parse(sliderTextJson);
     
      if (typeof slider_text !== "object" || slider_text === null || Array.isArray(slider_text)) {
        throw new Error("slider_text must be an object with keys en and kn");
      }
    } catch (err) {
      if (err instanceof Error) {
        return NextResponse.json(
          { status: 400, success: false, message: "Invalid slider_text JSON: " + err.message },
          { status: 400 }
        );
      }
    }
    const newTextSlider = new TextSlider({
      slider_text,
    });
    await newTextSlider.save();

    return NextResponse.json(
      { status: 201, success: true, data: newTextSlider }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message || "Failed to create text slider" },
        { status: 500 }
      );
    }
  }
}
