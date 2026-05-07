
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/database/database';
import { ReusePaginationMethod } from '@/utils/Pagination';
import { LesionModel } from '@/models/Lesion';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { page, skip, limit } = ReusePaginationMethod(req);
    const lesions = await LesionModel.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
    const totalLesions = await LesionModel.countDocuments()
    return NextResponse.json({
      message: 'Lesions retrieved successfully!',
      status: 200,
      lesions,
      totalLesions,
      page,
      limit
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { message: 'Error retrieving lesions', error: error.message },
        { status: 500 }
      );
    }
  }
}
