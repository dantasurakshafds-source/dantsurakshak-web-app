import { NextRequest, NextResponse } from 'next/server';
import TextSlider from '@/models/TextSlider';
import { EN, KN } from '@/utils/Constants';
import { getLanguage } from '@/utils/FilterLanguages';
import { dbConnect } from '@/database/database';
import { ReusePaginationMethod } from '@/utils/Pagination';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { page, skip, limit } = ReusePaginationMethod(request);
        const lang = getLanguage(request);
        const textSliders = await TextSlider.find().skip(skip).limit(limit).sort({ createdAt: -1 }).lean();
        const totalResults = await TextSlider.countDocuments();

        const localizedData = textSliders.map((doc) => {
            if (lang === EN || lang === KN) {
                return {
                    _id: doc._id,
                    slider_text: { [lang]: doc.slider_text?.[lang] || '' },
                    createdAt: doc.createdAt,
                    updatedAt: doc.updatedAt,
                };
            } else {
                return doc;
            }
        });

        return NextResponse.json({
            status: 200,
            success: true,
            result: localizedData,
            totalResults,
            page,
            limit,
        });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { success: false, message: error.message || 'Failed to get text sliders' },
                { status: 500 }
            );
        }
    }
}
