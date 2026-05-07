export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { getToken } from 'next-auth/jwt';
import { dbConnect } from '@/database/database';
import Questionnaire from '@/models/Questionnaire';
import { NextRequest, NextResponse } from 'next/server';
import { sendApprovalEmail } from '@/utils/Email';
import { LesionEmailData, Users } from '@/utils/Types';
import Notifications from '@/models/Notifications';
import admin from '@/firebasepusher/firebaseAdmin';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const id = (await params).id;

  try {
    const existingQuestionnaire = await Questionnaire.findById(id);
    if (!existingQuestionnaire) {
      return NextResponse.json({ message: 'Questionnaire record not found' }, { status: 404 });
    }
    if (existingQuestionnaire.status !== 'submit') {
      return NextResponse.json(
        { status: 400, message: 'Feedback can only be created when the questionnaire status is submit' },
        { status: 400 }
      );
    }
    if (existingQuestionnaire.send_email_to_dantasurakshaks === true) {
      return NextResponse.json(
        { status: 400, message: "Feedback has already been sent to dantasurakshaks." },
        { status: 400 }
      );
    }


    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET! });
    const adminId = token?.sub as string;

    const formData = await request.formData();
    const questionary_type = formData.get('questionary_type');
    const diagnosis_notes = formData.get('diagnosis_notes');
    const recomanded_actions = formData.get('recomanded_actions');
    const comments_or_notes = formData.get('comments_or_notes');

    const updated = await Questionnaire.findByIdAndUpdate(
      id,
      {
        questionary_type,
        diagnosis_notes,
        recomanded_actions,
        comments_or_notes,
        send_email_to_dantasurakshaks: true,
        assignTo: adminId,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .select('+questionary_type +diagnosis_notes +recomanded_actions +comments_or_notes +send_email_to_dantasurakshaks +assignTo');

    if (!updated) {
      return NextResponse.json({ message: 'Error updating questionnaire record' }, { status: 500 });
    }

    await updated.populate('submitted_by', 'email fcmToken name _id');
    const submitter = updated.submitted_by as Users;
    //@ts-expect-error ignore this message
    if (submitter?.fcmToken) {
      const message = {
        notification: {
          title: 'Feedback Submitted',
          body: 'Your questionnaire has been reviewed. Please check the feedback.',
        },
        //@ts-expect-error ignore this message
        token: submitter.fcmToken,
        android: {
          priority: 'high',
          notification: {
            channelId: 'fcm_default_channel',
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      };

      try {
        //@ts-expect-error ignore this message
        await admin.messaging().send(message);
        console.log(`✅ Push sent to Danta: ${submitter.name}`);
      } catch (pushError) {
        //@ts-expect-error ignore this message
        console.error(`❌ Push failed for Danta: ${submitter.email}`, pushError.message);
      }
    } else {
      console.warn(`⚠️ No FCM token for Danta user: ${submitter.name}`);
    }


    await Notifications.create({
      userId: submitter._id,
      title: 'Questionnaire Feedback Submitted',
      message: `Admin ( ${submitter?.name} )  has responded to your questionnaire with feedback.`,
      questionnaireId: updated._id,
      icon: 'feedback',
      read: false,
      createdAt: new Date(),
    });

    const submitterEmail = (updated.submitted_by as unknown as Users)?.email;
    if (submitterEmail) {
      await sendApprovalEmail(
        updated.toObject() as unknown as LesionEmailData,
        'adminQuestionaryfeedback',
        undefined,
        [submitterEmail]
      );
    }

    return NextResponse.json({
      message: `Admin replied successfully to questionnaire id ${id}`,
      status: 200,
      updatedQuestionary: updated,
    });
  } catch (error) {
    console.error("Error in Questionnaire feedback PUT:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: 'Error updating questionnaire record', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Unknown error' }, { status: 500 });
  }
}
