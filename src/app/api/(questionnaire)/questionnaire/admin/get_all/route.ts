import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/database/database';
import Questionnaire from '@/models/Questionnaire';
import { ReusePaginationMethod } from '@/utils/Pagination';




export async function GET(req: NextRequest) {
  try {
    await dbConnect();


    const { page, limit, skip } = ReusePaginationMethod(req);

    const [data, totalResults] = await Promise.all([
      Questionnaire.find({ status: 'submit' })
        .select('+questionary_type +diagnosis_notes +recomanded_actions +comments_or_notes +send_email_to_dantasurakshaks')
        .populate([
          { path: 'assignTo', select: 'name phoneNumber' },
          { path: 'submitted_by', select: 'name' }
        ])
        .skip(skip)
        .limit(limit)
        .lean(),
      Questionnaire.countDocuments({ status: 'submit' })
    ]);

    return NextResponse.json({
      status: 200,
      success: true,
      data,
      page,
      limit,
      totalResults,
    });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
    }
  }
}
