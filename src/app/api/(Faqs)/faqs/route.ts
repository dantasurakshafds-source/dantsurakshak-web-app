import { NextRequest, NextResponse } from "next/server";


import FaqModel from "@/models/Faqs";

import { ReusePaginationMethod } from "@/utils/Pagination";
import { getLanguage } from "@/utils/FilterLanguages";
import { dbConnect } from "@/database/database";
import { EN, KN } from '@/utils/Constants';
import { FAQRepeater } from "@/utils/Types";


export async function GET(request: NextRequest) {
    try {
        await dbConnect()
        const lang = getLanguage(request);
        const { page, skip, limit } = ReusePaginationMethod(request);
        const allFaqs = await FaqModel.find().limit(limit).skip(skip).sort({createdAt:-1}).lean();
        const totalResults = await FaqModel.countDocuments();

        const localizedData = allFaqs.map((item) => {
            if (lang === EN || lang === KN) {
                return {
                    _id: item._id,
                    faqs_title: { [lang]: item.faqs_title?.[lang] || '' },
                    faqs_repeater: item.faqs_repeater?.map((entry:FAQRepeater) => ({
                        question: { [lang]: entry.faqs_repeat_question?.[lang] || '' },
                        answer: { [lang]: entry.faqs_repeat_answer?.[lang] || '' },
                    })),
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                };
            } else {

                return item;
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
                { success: false, message: 'Failed to fetch FAQs' },
            );
        }
        return NextResponse.json(
            { success: false, message: 'Unknown error occurred' },

        );
    }
}