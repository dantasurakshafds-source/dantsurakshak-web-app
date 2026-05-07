
import { NextResponse } from 'next/server';
import { dbConnect } from '@/database/database';

import { generatePDFBase64 } from '@/utils/Constants';
import { LesionModel } from '@/models/Lesion';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    const id = (await params).id;

    try {
        const questionnaire = await LesionModel.findById(id)
            .select('+questionary_type +diagnosis_notes +recomanded_actions +comments_or_notes +send_email_to_dantasurakshaks');

        if (!questionnaire) {
            return NextResponse.json({ message: 'Questionnaire record not found' }, { status: 404 });
        }


        if (questionnaire.send_email_to_dantasurakshaks !== true) {
            return NextResponse.json(
                { message: 'Feedback has not been returned yet. No PDF available.' },
                { status: 400 }
            );
        }

        const pdfBase64 = await generatePDFBase64(
            questionnaire.toObject() as unknown as Record<string, unknown>
        );
        return NextResponse.json({ status: 200, message: 'PDF generated successfully', result: pdfBase64, });
    } catch (error) {
        console.error("Error generating PDF:", error);
        return NextResponse.json(
            { message: 'Error generating PDF', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
