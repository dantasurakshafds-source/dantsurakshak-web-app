import { dbConnect } from '@/database/database';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { sendApprovalEmail } from '@/utils/Email';
import { createVerificationToken, VERIFIABLE_ROLES } from '@/utils/Constants';



export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  if (!id) {
    return NextResponse.json(
      { status: 400, error: 'User ID (from URL) is required.' }
    );
  }

  try {
    await dbConnect();
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { status: 400, error: 'User not found.' }
      );
    }

   
    if (!VERIFIABLE_ROLES.includes(user.role)) {
      return NextResponse.json(
        { status: 400, error: `No verification needed for role '${user.role}'.` }
      );
    }

    if (user.isVerified===true) {
      return NextResponse.json(
        { status: 400, error: 'Email is already verified.' }
      );
    }

    const token = await createVerificationToken(String(user._id));
    await sendApprovalEmail(user, 'registerverificationcode', token);

    return NextResponse.json(
      { status: 200, message: 'Verification email sent successfully.' }
    );
  } catch (err) {
    if(err instanceof Error){
      return NextResponse.json(
        { status: 500, error: 'Server error.' }
      );
    }
  }
}
