import { dbConnect } from '@/database/database';
import AccountDeletionRequest from '@/models/AccountDeletionRequest';
import User from '@/models/User';
import Lesion from '@/models/Lesion';
import Questionnaire from '@/models/Questionnaire';
import Notifications from '@/models/Notifications';
import VerificationToken from '@/models/VerificationToken';
import QuestionnaireVerificationTokens from '@/models/QuestionnaireVerificationTokens';
import LesionVerificationTokens from '@/models/LesionVerificationTokens';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const request = await AccountDeletionRequest.findById(id).lean();
    if (!request) {
      return NextResponse.json(
        { error: 'Deletion request not found.' },
        { status: 404 }
      );
    }

    const userId = request.userId;

    // Fetch related records
    const [user, lesions, questionnaires, notificationsCount] = await Promise.all([
      User.findById(userId).select('-password').lean(),
      Lesion.find({ submitted_by: userId })
        .select('case_number fullname contact_number location status adminAction createdAt')
        .sort({ createdAt: -1 })
        .lean(),
      Questionnaire.find({ submitted_by: userId })
        .select('status adminAction createdAt presenceOfSharpTeeth presenceOfDecayedTeeth')
        .sort({ createdAt: -1 })
        .lean(),
      Notifications.countDocuments({ userId }),
    ]);

    return NextResponse.json({
      success: true,
      request,
      userExists: Boolean(user),
      user: user || null,
      relations: {
        lesions,
        lesionCount: lesions.length,
        questionnaires,
        questionnaireCount: questionnaires.length,
        notificationsCount,
      },
    });
  } catch (error) {
    console.error('Error fetching deletion request details:', error);
    return NextResponse.json(
      { error: 'Server error while fetching request details.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const request = await AccountDeletionRequest.findById(id);
    if (!request) {
      return NextResponse.json(
        { error: 'Deletion request not found.' },
        { status: 404 }
      );
    }

    const userId = request.userId;

    // Perform cascade deletion of all related records
    const [
      deletedLesions,
      deletedQuestionnaires,
      deletedNotifications,
      deletedTokens,
      deletedQuestionnaireTokens,
      deletedLesionTokens,
      deletedUser,
    ] = await Promise.all([
      Lesion.deleteMany({ submitted_by: userId }),
      Questionnaire.deleteMany({ submitted_by: userId }),
      Notifications.deleteMany({ userId }),
      VerificationToken.deleteMany({ userId }),
      QuestionnaireVerificationTokens.deleteMany({ userId }),
      LesionVerificationTokens.deleteMany({ userId }),
      User.findByIdAndDelete(userId),
    ]);

    // Mark deletion request as completed
    request.status = 'completed';
    request.processedAt = new Date();
    await request.save();

    return NextResponse.json({
      success: true,
      message: 'User and all associated records deleted permanently.',
      details: {
        userDeleted: Boolean(deletedUser),
        lesionsDeleted: deletedLesions.deletedCount,
        questionnairesDeleted: deletedQuestionnaires.deletedCount,
        notificationsDeleted: deletedNotifications.deletedCount,
        tokensDeleted:
          deletedTokens.deletedCount +
          deletedQuestionnaireTokens.deletedCount +
          deletedLesionTokens.deletedCount,
      },
    });
  } catch (error) {
    console.error('Error executing cascade user deletion:', error);
    return NextResponse.json(
      { error: 'Server error while deleting user and records.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, rejectionReason } = body;

    await dbConnect();

    const request = await AccountDeletionRequest.findById(id);
    if (!request) {
      return NextResponse.json(
        { error: 'Deletion request not found.' },
        { status: 404 }
      );
    }

    if (action === 'reject' || action === 'cancel') {
      request.status = 'rejected';
      request.rejectionReason = rejectionReason || 'Request rejected by super admin';
      request.processedAt = new Date();
      await request.save();

      return NextResponse.json({
        success: true,
        message: 'Deletion request cancelled / rejected.',
        request,
      });
    }

    return NextResponse.json({ error: 'Invalid action provided.' }, { status: 400 });
  } catch (error) {
    console.error('Error updating deletion request:', error);
    return NextResponse.json(
      { error: 'Server error while updating request.' },
      { status: 500 }
    );
  }
}
