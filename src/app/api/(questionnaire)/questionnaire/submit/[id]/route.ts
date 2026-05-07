export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { dbConnect } from '@/database/database';
import Questionnaire from '@/models/Questionnaire';
import User from '@/models/User';
import { sendApprovalEmail } from '@/utils/Email';
import { createQuestionnaireVerificationToken } from '@/utils/Constants';
import admin from '@/firebasepusher/firebaseAdmin';
import Notifications from '@/models/Notifications';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const id = (await params).id;
    const questionnaire = await Questionnaire.findOne({ _id: id }).populate('submitted_by');

    if (!questionnaire) {
      return NextResponse.json({ error: 'Questionnaire not found', status: 404 });
    }

    const alreadySubmitted = questionnaire.status === 'submit';
    if (!alreadySubmitted) {
      questionnaire.status = 'submit';
      await questionnaire.save();
    }

    const questionnaireData = JSON.parse(JSON.stringify(questionnaire));
    const adminUsers = await User.find({ _id: { $in: questionnaire.send_to } });

    for (const adminUser of adminUsers) {
      if (
        (adminUser.role === 'admin' || adminUser.role === 'dantasurakshaks') &&
        adminUser.isVerified
      ) {
        const token = await createQuestionnaireVerificationToken(
          String(questionnaire._id),
          String(adminUser._id)
        );

        try {
          await sendApprovalEmail(
            questionnaireData,
            'questionnaire',
            token,
            [adminUser.email]
          );
          console.log(`Approval email sent to: ${adminUser.email}`);

          // 🔔 Push notification
          if (adminUser.fcmToken) {
            const message = {
              notification: {
                title: 'New Questionnaire Submitted',
                //@ts-expect-error ignore this 
                body: `A questionnaire from ${questionnaire.submitted_by.name} has been submitted for your approval.`,
              },
              token: adminUser.fcmToken,
              data: {
                id: questionnaire._id.toString(),
                type: 'questionnaire',
              },
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
              //@ts-expect-error ignore this 
              await admin.messaging().send(message);
              console.log(`Push notification sent to: ${adminUser.name}`);
            } catch (pushError) {
              //@ts-expect-error ignore this 
              console.error(`Push notification failed for ${adminUser.email}:`, pushError.message);
              //@ts-expect-error ignore this 
              const errorCode = pushError?.errorInfo?.code;
              if (
                errorCode === 'messaging/registration-token-not-registered' ||
                errorCode === 'messaging/invalid-argument'
              ) {
                console.warn(`Invalid FCM token for ${adminUser.email}. Consider removing it.`);
              }
            }
          } else {
            console.log(`No FCM token for ${adminUser.name}`);
          }

          // 📥 Create backend notification
          await Notifications.create({
            userId: adminUser._id,
            title: 'New Questionnaire Submitted',
            //@ts-expect-error ignore this 
            message: `A questionnaire from ${questionnaire.submitted_by.name} has been submitted for your approval.`,
            questionnaire_Id: questionnaire._id,
            icon: 'assignment',
            read: false,
            createdAt: new Date(),
          });
        } catch (err) {
          console.error(`Failed for ${adminUser.email}:`, err);
        }
      }
    }

    return NextResponse.json({
      status: 200,
      message: alreadySubmitted
        ? 'The questionnaire was already submitted, but notifications have been sent again.'
        : 'Questionnaire submitted for approval successfully.',
    });
  } catch (error) {
    console.error('Unexpected server error:', error);
    return NextResponse.json({ error: 'Server error', status: 500 });
  }
}
