import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/database/database';
import { ReusePaginationMethod } from '@/utils/Pagination';
import { LesionModel } from '@/models/Lesion';



export async function GET(req: NextRequest) {
    try {
        await dbConnect();


        const { page, limit, skip } = ReusePaginationMethod(req);

        const [lesions, total] = await Promise.all([
            LesionModel.find({ status: 'submit' })
                .select('+lesion_type +diagnosis_notes +recomanded_actions +comments_or_notes +send_email_to_dantasurakshaks')
                .populate([
                    { path: 'assignTo', select: 'name phoneNumber' },
                    { path: 'submitted_by', select: 'name' }
                ])
                .skip(skip)
                .limit(limit)
                .lean(),
            LesionModel.countDocuments({ status: 'submit' }),
        ]);

        return NextResponse.json({
            status: 200,
            success: true,
            lesions: lesions,
            page,
            limit,
            totalResults: total,
        });
    } catch (err) {
        if (err instanceof Error) {
            return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
        }


    }
}
