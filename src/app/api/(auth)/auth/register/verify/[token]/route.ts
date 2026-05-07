import { dbConnect } from '@/database/database';
import User from '@/models/User';
import VerificationToken from '@/models/VerificationToken';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await dbConnect();
    const  token  = (await params).token;
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required.' },
        { status: 400 }
      );
    }

    const verificationRecord = await VerificationToken.findOne({ token });
    if (!verificationRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired token.' },
        { status: 400 }
      );
    }
    const user = await User.findById(verificationRecord.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }


    user.isVerified = true;
    await user.save();
    await VerificationToken.deleteOne({ token });
    return NextResponse.json(
      {status: 200, message: 'Email verified successfully.' },
     
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
