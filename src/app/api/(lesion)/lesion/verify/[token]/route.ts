 
import { NextResponse } from 'next/server';
import { dbConnect } from '@/database/database';
import { LesionModel } from '@/models/Lesion';
 
import { renderConfirmationPage } from '@/utils/Constants';
import LesionVerificationTokens from '@/models/LesionVerificationTokens';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const token  = (await params).token;
  const action = new URL(request.url).searchParams.get('action');

  try {
    await dbConnect();
    const record = await LesionVerificationTokens.findOne({ token });
    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired token.', status: 400 });
    }

    const lesion = await LesionModel.findById(record.lesionId);
    if (!lesion) {
      return NextResponse.json({ error: 'Lesion record not found.', status: 404 });
    }

    if (action === 'approve') {
      lesion.adminAction = true;
      lesion.assignTo    = record.adminId;
      lesion.status      = 'submit';
      await lesion.save();

     
      await LesionVerificationTokens.deleteMany({ lesionId: record.lesionId });
    } else {
      return NextResponse.json({ error: 'Invalid action.', status: 400 });
    }

    const html = renderConfirmationPage({
      recordType: "Lesion",
      action: action || '',
      id: lesion._id as string,
      redirectUrl: process.env.NEXT_PUBLIC_API_URL
    });

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
