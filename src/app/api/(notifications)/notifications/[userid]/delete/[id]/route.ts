import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/database/database';
import Notifications from '@/models/Notifications';
 
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const notificationId = (await params).id;
    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    const deleted = await Notifications.findByIdAndDelete(notificationId);

    if (!deleted) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }
    return NextResponse.json({
      status: 200,
      success: true,
      message: 'Notification deleted successfully.',
    });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json(
        { success: false, error: err.message || 'Server error' },
      );
    }
  }
}



