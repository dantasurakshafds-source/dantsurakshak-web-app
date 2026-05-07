import { dbConnect } from '@/database/database';
import VerificationToken from '@/models/VerificationToken';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {

    const token=(await params).token
 
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  try {
    await dbConnect();

    const verifyToken = await VerificationToken.findOne({ token });
    if (!verifyToken) {
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 400 });
    }

    const user = await User.findById(verifyToken.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    if (action === 'approve') {
      user.status = 'approved';
    } else if (action === 'reject') {
      user.status = 'rejected';
      
      user.role = 'user';
    } else {
      return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    }

    await user.save();
 
    await VerificationToken.deleteOne({ token });

    return NextResponse.json({ message: `User ${action}d successfully!` }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
