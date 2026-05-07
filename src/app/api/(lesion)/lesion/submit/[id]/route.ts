
import { NextResponse } from 'next/server';
import { dbConnect } from '@/database/database';
import { LesionModel } from '@/models/Lesion';
import User from '@/models/User';
 
import { sendApprovalEmail } from '@/utils/Email';
import { LesionEmailData } from '@/utils/Types';
import { createLesionVerificationToken } from '@/utils/Constants';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const id = (await params).id;
    const lesion = await LesionModel.findOne({ _id: id });
    if (!lesion) {
      return NextResponse.json({ error: 'Lesion record not found', status: 404 });
    }
    if (lesion.status === 'submit') {
      return NextResponse.json({
        status: 200,
        message: "The lesion has already been submitted and cannot be sent again."
      });
    }

 
    lesion.status = 'submit';
    await lesion.save();

   
    const lesionData = lesion.toObject();
    lesionData._id = String(lesionData._id);

 
    const adminIds   = lesion.send_to;
    const adminUsers = await User.find({ _id: { $in: adminIds } });

   
    for (const admin of adminUsers) {
      if (
        (admin.role === "admin" || admin.role === "dantasurakshaks")
        && admin.isVerified
      ) {
        const token = await createLesionVerificationToken(
          String(lesion._id),
          String(admin._id)
        );
        try {
          await sendApprovalEmail(
            lesionData as unknown as LesionEmailData,
            "lesion",
            token,
            [admin.email]
          );
          console.log(`Approval email sent to ${admin.email}`);
        } catch (mailErr) {
          console.error(`Failed to send to ${admin.email}:`, mailErr);
        }
      }
    }

    return NextResponse.json({
      status: 200,
      message: 'Lesion submitted for approval successfully.'
    });
  } catch (error) {
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message, status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred', status: 500 });
  }
}
