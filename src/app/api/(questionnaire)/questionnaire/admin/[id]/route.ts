import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/database/database';
import Questionnaire from '@/models/Questionnaire';



export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();


        const id = (await params).id;
        const q = await Questionnaire.findOne({ _id: id, status: 'submit' })
            .select('+questionary_type +diagnosis_notes +recomanded_actions +comments_or_notes +send_email_to_dantasurakshaks')
            .populate([
                { path: 'assignTo', select: 'name phoneNumber' },
                { path: 'submitted_by', select: 'name' }
            ])
            .lean();

        if (!q) {
            return NextResponse.json({ success: false, status: 404, error: 'no record found' });
        }

        return NextResponse.json({ status: 200, success: true, data: q });
    } catch (err) {
        if (err instanceof Error) {
            return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
        }
    }
}
