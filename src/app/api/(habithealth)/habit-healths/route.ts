import { NextRequest, NextResponse } from 'next/server';
import { EN, KN } from '@/utils/Constants';
import { getLanguage } from '@/utils/FilterLanguages';
import { ReusePaginationMethod } from '@/utils/Pagination';
import { dbConnect } from '@/database/database';
import HabitsHealth from '@/models/HabitsHealth';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const lang = getLanguage(request);
        const { page, skip, limit } = ReusePaginationMethod(request);

        const allDocs = await HabitsHealth.find().limit(limit).skip(skip).sort({ createdAt: -1 }).lean();
        const totalResults = await HabitsHealth.countDocuments();

        const localizedData = allDocs.map((item) => {
            if (lang === EN || lang === KN) {
                return {
                    _id: item._id,
                    habit_health_main_title: { [lang]: item.habit_health_main_title?.[lang] || '' },
                    habit_health_main_image: item.habit_health_main_image,
                    habit_health_repeater: item.habit_health_repeater,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                };
            } else {
                return item;
            }
        });
        return NextResponse.json(
            {
                status: 200,
                success: true,
                result: localizedData,
                totalResults,
                page,
                limit,
            },
        );
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { status: 500, success: false, message: 'Failed to fetch habits health documents' },

            );
        }
    }
}
