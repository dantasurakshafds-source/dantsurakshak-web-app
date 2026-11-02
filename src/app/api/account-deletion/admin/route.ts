import { dbConnect } from '@/database/database';
import AccountDeletionRequest from '@/models/AccountDeletionRequest';
import { ReusePaginationMethod } from '@/utils/Pagination';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { page, limit, skip } = ReusePaginationMethod(req);
    const status = req.nextUrl.searchParams.get('status');

    interface QueryFilter {
      status?: string;
    }
    const query: QueryFilter = {};
    if (status && ['pending', 'completed', 'rejected'].includes(status)) {
      query.status = status;
    }

    const [requests, totalFiltered, countsAgg] = await Promise.all([
      AccountDeletionRequest.find(query)
        .populate('userId', 'name email phoneNumber role status')
        .populate('processedBy', 'name email')
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AccountDeletionRequest.countDocuments(query),
      AccountDeletionRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const counts = {
      pending: 0,
      completed: 0,
      rejected: 0,
      total: 0,
    };

    countsAgg.forEach((item: { _id: string; count: number }) => {
      if (item._id === 'pending') counts.pending = item.count;
      if (item._id === 'completed') counts.completed = item.count;
      if (item._id === 'rejected') counts.rejected = item.count;
      counts.total += item.count;
    });

    return NextResponse.json({
      message: 'Deletion requests retrieved successfully',
      requests,
      total: totalFiltered,
      page,
      limit,
      counts,
    });
  } catch (error) {
    console.error('Error fetching deletion requests:', error);
    return NextResponse.json(
      { error: 'Server error while fetching deletion requests.' },
      { status: 500 }
    );
  }
}
