import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/database/database';
import Questionnaire from '@/models/Questionnaire';
import { ReusePaginationMethod } from '@/utils/Pagination';
import { Types } from 'mongoose';

interface AssignToUser {
    _id: Types.ObjectId;
    name: string;
    phoneNumber: string;
}
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const userId = (await params).id;
        if (!userId) {
            return NextResponse.json(
                { status: 400, success: false, error: 'User ID is required' },
            );
        }
        const { page, limit, skip } = ReusePaginationMethod(req);
        const [data, totalResults] = await Promise.all([
            Questionnaire.find({ submitted_by: userId })
                .select(
                    '+questionary_type +diagnosis_notes +recomanded_actions +comments_or_notes +send_email_to_dantasurakshaks'
                )
                .populate<{ assignTo: AssignToUser }>([
                    { path: 'assignTo', select: 'name phoneNumber' },
                    { path: 'submitted_by', select: 'name' },
                ])
                .skip(skip)
                .limit(limit)
                .lean(),
            Questionnaire.countDocuments({ assignTo: userId }),
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
            return NextResponse.json(
                { status: 500, success: false, error: err.message || 'Server error' },
            );
        }
        return NextResponse.json(
            { success: false, error: 'Unknown server error' },

        );
    }
}