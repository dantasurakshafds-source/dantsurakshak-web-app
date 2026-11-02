import { dbConnect } from '@/database/database';
import User from '@/models/User';
import Lesion from '@/models/Lesion';
import Questionnaire from '@/models/Questionnaire';
import AccountDeletionRequest from '@/models/AccountDeletionRequest';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email, phoneNumber, reason } = body;

    if (!email || !phoneNumber) {
      return NextResponse.json(
        { error: 'Email and phone number are required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phoneNumber.toString().trim();
    const cleanPhone = trimmedPhone.replace(/\D/g, '');
    const last10Digits = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;

    const user = await User.findOne({
      email: { $regex: new RegExp(`^${trimmedEmail}$`, 'i') },
      $or: [
        { phoneNumber: trimmedPhone },
        { phoneNumber: { $regex: `${last10Digits}$` } },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User account not found.' },
        { status: 404 }
      );
    }

    // Check if there is already an active pending request
    const existingPending = await AccountDeletionRequest.findOne({
      userId: user._id,
      status: 'pending',
    });

    if (existingPending) {
      return NextResponse.json(
        {
          error:
            'A deletion request for this account has already been submitted and is currently pending review by the super admin.',
          requestId: existingPending._id,
        },
        { status: 409 }
      );
    }

    const [lesionCount, questionnaireCount] = await Promise.all([
      Lesion.countDocuments({ submitted_by: user._id }),
      Questionnaire.countDocuments({ submitted_by: user._id }),
    ]);

    const newRequest = await AccountDeletionRequest.create({
      userId: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || trimmedPhone,
      reason: reason?.trim() || 'User requested account deletion via web page',
      status: 'pending',
      lesionCount,
      questionnaireCount,
      requestedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message:
        'Your account deletion request has been submitted successfully. The Super Admin will review and permanently remove your account and all associated records.',
      requestId: newRequest._id,
    });
  } catch (error: unknown) {
    console.error('Error submitting deletion request:', error);
    return NextResponse.json(
      { error: 'Failed to submit account deletion request. Please try again later.' },
      { status: 500 }
    );
  }
}
