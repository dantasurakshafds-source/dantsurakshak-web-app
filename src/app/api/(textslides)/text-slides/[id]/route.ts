
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

import TextSlider from '@/models/TextSlider';
import { EN, KN } from '@/utils/Constants';
import { getLanguage } from '@/utils/FilterLanguages';
import { dbConnect } from '@/database/database';
import { TextSlideType } from '@/utils/Types';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const lang = getLanguage(request);
        const id = (await params).id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: 'Invalid text slider ID' },
                { status: 400 }
            );
        }

        const textSlider = (await TextSlider.findById(id).lean()) as TextSlideType | null;
        if (!textSlider) {
            return NextResponse.json(
                { success: false, message: 'Text slider not found' },
                { status: 404 }
            );
        }

        let localizedTextSlider = textSlider;
        if (lang === EN || lang === KN) {
            localizedTextSlider = {
                _id: textSlider._id,
                slider_text: { [lang]: textSlider.slider_text?.[lang] || '' },
                createdAt: textSlider.createdAt,
                updatedAt: textSlider.updatedAt,
            };
        }
        return NextResponse.json({ success: true, result: localizedTextSlider });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { status: 500, success: false, message: error.message || 'Failed to fetch text slider' }
            );
        }
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
                { status: 400, success: false, message: 'Invalid text slider ID' },

            );
        }
        const deletedTextSlider = await TextSlider.findByIdAndDelete(id);
        if (!deletedTextSlider) {
            return NextResponse.json(
                { status: 404, success: false, message: 'Text slider not found' },

            );
        }
        return NextResponse.json({
            status: 200,
            success: true,
            message: 'Text slider deleted successfully',
        });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { success: false, message: error.message || 'Failed to delete text slider' },
                { status: 500 }
            );
        }
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
                { success: false, message: 'Invalid text slider ID' },
                { status: 400 }
            );
        }
        const textSlider = await TextSlider.findById(id);
        if (!textSlider) {
            return NextResponse.json(
                { success: false, message: 'Text slider not found' },
                { status: 404 }
            );
        }
        const formData = await req.formData();
        const updateField = (fieldName: string) => {
            const fieldJson = formData.get(fieldName)?.toString();
            if (fieldJson) {
                try {
                    const parsedObj = JSON.parse(fieldJson);
                    if (
                        typeof parsedObj !== 'object' ||
                        Array.isArray(parsedObj) ||
                        parsedObj === null
                    ) {
                        throw new Error(`${fieldName} must be an object`);
                    }
               
                    textSlider[fieldName] = parsedObj;
                } catch (err) {
                    throw new Error(`Invalid ${err} - ${fieldName} JSON`);
                }
            }
        };
        updateField('slider_text');
        await textSlider.save();
        return NextResponse.json({
            success: true,
            message: 'Text slider updated successfully',
            data: textSlider,
        });
    } catch (err) {
        if (err instanceof Error) {
            return NextResponse.json(
                { success: false, message: err.message || 'Failed to update text slider' },
                { status: 500 }
            );
        }
    }
}

