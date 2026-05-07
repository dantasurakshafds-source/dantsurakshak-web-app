import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/database/database';
import Notifications from '@/models/Notifications';
import { ReusePaginationMethod } from '@/utils/Pagination';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const userId = (await params).id;

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { page, limit, skip } = ReusePaginationMethod(req);

    const notifications = await Notifications.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalResults = await Notifications.countDocuments({ userId });

    return NextResponse.json({
      status: 200,
      success: true,
      data: notifications,
      page,
      limit,
      totalResults,
    });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json(
        { success: false, error: err.message || 'Server error' },
      );
    }
  }
}








