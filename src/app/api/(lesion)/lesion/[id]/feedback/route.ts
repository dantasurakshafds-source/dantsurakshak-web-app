 
import { dbConnect } from '@/database/database';
import { LesionModel } from '@/models/Lesion';
import { NextRequest, NextResponse } from 'next/server';
import { sendApprovalEmail } from '@/utils/Email';
import { LesionEmailData, Users } from '@/utils/Types';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const id = (await params).id;
  try {
    const existingLesion = await LesionModel.findById(id);
    if (!existingLesion) {
      return NextResponse.json({ message: 'Lesion record not found' }, { status: 404 });
    }
    if (existingLesion.status !== 'submit') {
      return NextResponse.json(
        { status: 400, message: 'Feedback can only be created when the lesion status is submit' },
        { status: 400 }
      );
    }
    if (existingLesion.send_email_to_dantasurakshaks === true) {
      return NextResponse.json(
        { status: 400, message: "Feedback has already been sent to dantasurakshaks." },
        { status: 400 }
      );
    }
    const formData = await request.formData();
    const lesion_type = formData.get('lesion_type');
    const diagnosis_notes = formData.get('diagnosis_notes');
    const recomanded_actions = formData.get('recomanded_actions');
    const comments_or_notes = formData.get('comments_or_notes');

    const updatedLesion = await LesionModel.findByIdAndUpdate(
      id,
      {
        lesion_type,
        diagnosis_notes,
        recomanded_actions,
        comments_or_notes,
        send_email_to_dantasurakshaks: true,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .select('+lesion_type +diagnosis_notes +recomanded_actions +comments_or_notes +send_email_to_dantasurakshaks');

    if (!updatedLesion) {
      return NextResponse.json({ message: 'Error updating lesion record' }, { status: 500 });
    }
    await updatedLesion.populate('submitted_by', 'email');

    const submitterEmail = (updatedLesion.submitted_by as unknown as Users)?.email;
    if (submitterEmail) {
      await sendApprovalEmail(
        updatedLesion.toObject() as unknown as LesionEmailData,
        'adminlesionfeedback',
        undefined,
        [submitterEmail]
      );
    }

    return NextResponse.json({
      message: `Admin replied successfully to lesion id ${id}`,
      status: 200,
      updatedLesion,
    });
  } catch (error) {
    console.error('PUT /lesion/[id]/feedback error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ message: 'Error updating lesion record', error }, { status: 500 });
    }
  }
}
