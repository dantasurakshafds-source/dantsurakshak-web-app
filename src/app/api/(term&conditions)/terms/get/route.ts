import { dbConnect } from "@/database/database";
import TermsAndConditionsModel from "@/models/TermsAndConditions";
import { ReusePaginationMethod } from "@/utils/Pagination";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    await dbConnect();
    const { page, limit, skip } = ReusePaginationMethod(request);
    const list = await TermsAndConditionsModel.find().skip(skip).limit(limit).lean();
    const total = await TermsAndConditionsModel.countDocuments();
    return NextResponse.json({
        success: true,
        result: list,
        totalResults: total,
        page,
        limit
    });
}

