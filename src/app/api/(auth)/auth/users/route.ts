interface UserQuery {
  role?: string;
}


import { dbConnect } from '@/database/database';
import User from '@/models/User';
import { ReusePaginationMethod } from '@/utils/Pagination';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { page, limit, skip } = ReusePaginationMethod(req);

    const role = req.nextUrl.searchParams.get('role');

    const query: UserQuery = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query, {
      id: 1,
      name: 1,
      email: 1,
      phoneNumber: 1,
      role: 1,
      status: 1,
      isVerified: 1
    })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    const totalFilteredUsers = await User.countDocuments(query);

    let roleCounts: Record<string, number> = {};

    if (role) {
      roleCounts[role] = totalFilteredUsers;
    } else {
      const roles = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]);

      roleCounts = roles.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {} as Record<string, number>);
    }

    return NextResponse.json(
      {
        message: 'Users retrieved successfully',
        users,
        total: totalFilteredUsers,
        roles: roleCounts,
        page,
        limit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Server error while fetching users.' },
      { status: 500 }
    );
  }
}
