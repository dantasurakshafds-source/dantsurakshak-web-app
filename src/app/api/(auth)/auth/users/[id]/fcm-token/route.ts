import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { dbConnect } from '@/database/database';
import User from '@/models/User';

const secret = process.env.NEXTAUTH_SECRET!;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req, secret });

  if (!token) {
    return NextResponse.json({ status: 401, message: "Unauthorized" }, { status: 401 });
  }

  const id = (await params).id;
  const { fcmToken } = await req.json();

  if (!fcmToken) {
    return NextResponse.json({ status: 400, message: "FCM token required" }, { status: 400 });
  }

  try {
    await dbConnect();
    await User.findByIdAndUpdate(id, { fcmToken }, { new: true });

    return NextResponse.json({ status: 200, message: "FCM token updated" });
  } catch (error) {
    console.error("FCM update error:", error);
    return NextResponse.json({ status: 500, message: "Error updating FCM token" }, { status: 500 });
  }
}
