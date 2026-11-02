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
    const { email, phoneNumber } = body;

    if (!email || !phoneNumber) {
      return NextResponse.json(
        { error: 'Both registered email and phone number are required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phoneNumber.toString().trim();
    const cleanPhone = trimmedPhone.replace(/\D/g, '');
    const last10Digits = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;

    // Search user matching email and phone number
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${trimmedEmail}$`, 'i') },
      $or: [
        { phoneNumber: trimmedPhone },
        { phoneNumber: { $regex: `${last10Digits}$` } },
      ],
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            'No matching account found with the provided email and phone number. Please check and try again.',
        },
        { status: 404 }
      );
    }

    // Query user activities & relation records
    const [
      lesionCount,
      questionnaireCount,
      recentLesions,
      recentQuestionnaires,
      pendingRequest,
    ] = await Promise.all([
      Lesion.countDocuments({ submitted_by: user._id }),
      Questionnaire.countDocuments({ submitted_by: user._id }),
      Lesion.find({ submitted_by: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('case_number status location createdAt'),
      Questionnaire.find({ submitted_by: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('status createdAt'),
      AccountDeletionRequest.findOne({
        userId: user._id,
        status: 'pending',
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Account verified successfully.',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          createdAt: user.createdAt,
        },
        lesionCount,
        questionnaireCount,
        recentLesions,
        recentQuestionnaires,
        hasPendingRequest: Boolean(pendingRequest),
        pendingRequestId: pendingRequest?._id || null,
      },
    });
  } catch (error: unknown) {
    console.error('Error verifying user for deletion:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while searching for account details.' },
      { status: 500 }
    );
  }
}
