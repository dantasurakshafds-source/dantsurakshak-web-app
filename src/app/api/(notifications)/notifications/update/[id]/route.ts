import {  NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/database/database';
import Notifications from '@/models/Notifications';
 


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const notificationId = (await params).id;
 
 
  try {
    await dbConnect();
    const notification = await Notifications.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
    return NextResponse.json({ status: 200,message:'notification updated successfuly',notification });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}