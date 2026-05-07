
import { NextResponse } from 'next/server';
import { dbConnect } from '@/database/database';
import Questionnaire from '@/models/Questionnaire';
import QuestionnaireVerificationTokens from '@/models/QuestionnaireVerificationTokens';
import { renderConfirmationPage } from '@/utils/Constants';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const tokenValue = (await params).token;
  const action = new URL(request.url).searchParams.get('action');

  try {
    await dbConnect();


    const record = await QuestionnaireVerificationTokens.findOne({ token: tokenValue });
    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired token.', status: 400 }, { status: 400 });
    }


    const questionnaire = await Questionnaire.findById(record.questionnaireId);
    if (!questionnaire) {

      await QuestionnaireVerificationTokens.deleteMany({ questionnaireId: record.questionnaireId });
      return NextResponse.json({ error: 'Questionnaire not found.', status: 404 }, { status: 404 });
    }


    if (questionnaire.adminAction === true) {

      await QuestionnaireVerificationTokens.deleteMany({ questionnaireId: record.questionnaireId });
      return NextResponse.json(
        { error: 'This questionnaire has already been taken over by an admin.', status: 400 },

      );
    }


    if (action === 'approve') {
      questionnaire.adminAction = true;
      questionnaire.assignTo = record.adminId;
      questionnaire.status = 'submit';
      await questionnaire.save();


      await QuestionnaireVerificationTokens.deleteMany({ questionnaireId: record.questionnaireId });
    } else {
      return NextResponse.json({ error: 'Invalid action.', status: 400 }, { status: 400 });
    }


    const html = renderConfirmationPage({
      recordType: 'Questionnaire',
      action: action || '',
      id: questionnaire._id.toString(),
      redirectUrl: process.env.NEXT_PUBLIC_API_URL!
    });

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });

    }

  }
}
