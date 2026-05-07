import { dbConnect } from "@/database/database";
import TermsAndConditionsModel, { ITermsRepeater } from "@/models/TermsAndConditions";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ success: false, message: 'Invalid ID' });
  }

  try {
    const formData = await request.formData();
    const repeaterRaw = formData.get('terms_repeater');
    if (!repeaterRaw) {
      return NextResponse.json({ success: false, message: 'Missing terms_repeater' });
    }

    let arr: unknown;
    try {
      arr = JSON.parse(repeaterRaw.toString());
    } catch (e) {
      return NextResponse.json({
        success: false,
        message: `Invalid JSON: ${(e as Error).message}`
      });
    }

    if (!Array.isArray(arr)) {
      return NextResponse.json({
        success: false,
        message: 'terms_repeater must be an array'
      });
    }

    const updated = await TermsAndConditionsModel.findByIdAndUpdate(
      id,
      { $set: { terms_repeater: arr as ITermsRepeater[] } },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Not found' });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
  }
  const deleted = await TermsAndConditionsModel.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Terms and Conditions deleted successfully' });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const id = (await params).id;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
  }
  const doc = await TermsAndConditionsModel.findById(id);
  if (!doc) {
    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, result: doc });
}