
import { NextRequest, NextResponse } from 'next/server';

import { EN, KN } from '@/utils/Constants';
import { getLanguage } from '@/utils/FilterLanguages';
import { dbConnect } from '@/database/database';
import FaqModel from '@/models/Faqs';
import mongoose from 'mongoose';
import { FaqRepeaterEntry, ReplacedFaqType } from '@/utils/Types';


export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const lang = getLanguage(request);
        const id = (await params).id;
        const faq = await FaqModel.findById(id).lean() as ReplacedFaqType;

        if (!faq) {
            return NextResponse.json(
                { status: 200, success: false, message: 'FAQ not found' }
            );
        }

        let localizedFaq;
        if (lang === EN || lang === KN) {
            localizedFaq = {
                _id: faq._id,
                faqs_title: { [lang]: faq.faqs_title?.[lang] || '' },
                faqs_repeater: faq.faqs_repeater?.map((entry: FaqRepeaterEntry) => ({
                    question: { [lang]: entry.faqs_repeat_question?.[lang] || '' },
                    answer: { [lang]: entry.faqs_repeat_answer?.[lang] || '' },
                })),
                createdAt: faq.createdAt,
                updatedAt: faq.updatedAt,
            };
        } else {
            localizedFaq = faq;
        }

        return NextResponse.json({
            status: 200,
            success: true,
            result: localizedFaq
        });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { success: false, message: 'Failed to fetch FAQ' },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { success: false, message: 'Unknown error occurred' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const id = (await params).id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: 'Invalid FAQ ID' },
                { status: 400 }
            );
        }

        const deletedFaq = await FaqModel.findByIdAndDelete(id);

        if (!deletedFaq) {
            return NextResponse.json(
                { success: false, message: 'FAQ not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            status: 200,
            success: true,
            message: 'FAQ deleted successfully',
        });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { success: false, message: 'Failed to delete FAQ' },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { success: false, message: 'Unknown error occurred' },
            { status: 500 }
        );
    }
}


export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const id = (await params).id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: 'Invalid FAQ ID' },
                { status: 400 }
            );
        }

        const faq = await FaqModel.findById(id);

        if (!faq) {
            return NextResponse.json(
                { success: false, message: 'FAQ not found' },
                { status: 404 }
            );
        }

        const formData = await req.formData();


        const updateBilingualField = (fieldName: string) => {
            const fieldJson = formData.get(fieldName)?.toString();
            if (fieldJson) {
                try {
                    const parsed = JSON.parse(fieldJson);
                    if (parsed.en !== undefined) {
                        faq[fieldName].en = parsed.en;
                    }
                    if (parsed.kn !== undefined) {
                        faq[fieldName].kn = parsed.kn;
                    }
                } catch (err) {
                    if (err instanceof Error) {
                        throw new Error(`Invalid ${fieldName} JSON`);
                    }
                }
            }
        };


        const updateRepeaterField = (fieldName: string) => {
            const fieldJson = formData.get(fieldName)?.toString();
            if (fieldJson) {
                try {
                    const parsedArray = JSON.parse(fieldJson);
                    if (!Array.isArray(parsedArray)) {
                        throw new Error(`${fieldName} must be an array`);
                    }
                    faq[fieldName] = parsedArray;
                } catch (err) {
                    if (err instanceof Error) {
                        throw new Error(`Invalid ${fieldName} JSON`);
                    }
                }
            }
        };


        updateBilingualField('faqs_title');
        updateRepeaterField('faqs_repeater');

        await faq.save();

        return NextResponse.json({
            status: 200,
            success: true,
            message: 'FAQ updated successfully',
            data: faq,
        });
    } catch (err) {
        if (err instanceof Error) {
            return NextResponse.json(
                { success: false, message: err.message || 'Failed to update FAQ' },

            );
        }
        return NextResponse.json(
            { success: false, message: 'Unknown error occurred' },

        );
    }
}
