import { NextRequest, NextResponse } from 'next/server';
import { EN, KN } from '@/utils/Constants';
import { getLanguage } from '@/utils/FilterLanguages';
import { dbConnect } from '@/database/database';
import HabitsHealth from '@/models/HabitsHealth';
import { HabitsHealthType } from '@/utils/Types';
import mongoose from 'mongoose';
import { uploadPhotoToCloudinary } from '@/utils/Cloudinary';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const lang = getLanguage(request);
        const id = (await params).id;
        const doc = (await HabitsHealth.findById(id).lean()) as HabitsHealthType | null;
        if (!doc) {
            return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
        }

        let localizedData;
        if (lang === EN || lang === KN) {
            localizedData = {
                _id: doc._id,
                habit_health_main_title: { [lang]: doc.habit_health_main_title?.[lang] || '' },
                habit_health_main_image: doc.habit_health_main_image,
                habit_health_repeater: doc.habit_health_repeater,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            };
        } else {
            localizedData = doc;
        }
        return NextResponse.json({ status: 200, success: true, result: localizedData });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { success: false, message: 'Failed to fetch the document' },
                { status: 500 }
            );
        }

    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const id = (await params).id;
        const deletedDoc = await HabitsHealth.findByIdAndDelete(id);
        if (!deletedDoc) {
            return NextResponse.json({ status: 404, success: false, message: 'Document not found' },);
        }
        return NextResponse.json(
            { status: 200, success: true, message: 'Document deleted successfully' },

        );
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { status: 500, success: false, message: 'Failed to delete the document' },

            );
        }

    }
}







export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect()
        const id = (await params).id


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: 'Invalid HabitsHealth ID' },

            )
        }

        const habitsDoc = await HabitsHealth.findById(id)
        if (!habitsDoc) {
            return NextResponse.json(
                { success: false, message: 'Habit health document not found' },

            )
        }


        const formData = await req.formData()


        const parseJsonField = (fieldName: string) => {
            const fieldValue = formData.get(fieldName)?.toString()
            if (!fieldValue) return null
            try {
                return JSON.parse(fieldValue)
            } catch (err) {
                if(err instanceof Error){
                    throw new Error(`Invalid JSON in ${fieldName}`)
                }
            }
        }


        const mainTitle = parseJsonField('habit_health_main_title')
        if (mainTitle) {
            if (typeof mainTitle.en === 'string') {
                habitsDoc.habit_health_main_title.en = mainTitle.en
            }
            if (typeof mainTitle.kn === 'string') {
                habitsDoc.habit_health_main_title.kn = mainTitle.kn
            }
        }


        const imageFile = formData.get('habit_health_main_image')
        const imageUrl = formData.get('habit_health_main_image_url')

        if (imageFile instanceof Blob) {
            habitsDoc.habit_health_main_image = await uploadPhotoToCloudinary(imageFile)
        } else if (typeof imageUrl === 'string' && imageUrl) {
            habitsDoc.habit_health_main_image = imageUrl
        }


        const repeaterData = parseJsonField('habit_health_repeater')
        if (Array.isArray(repeaterData)) {
            habitsDoc.habit_health_repeater = repeaterData.map(item => {
                if (!item.description || !Array.isArray(item.description)) {
                    return { description: [{ en: '', kn: '' }] }
                }
                return {
                    //@ts-expect-error ignore this message
                    description: item.description.map(desc => ({
                        en: typeof desc.en === 'string' ? desc.en : '',
                        kn: typeof desc.kn === 'string' ? desc.kn : ''
                    }))
                }
            })
        }

        await habitsDoc.save()

        return NextResponse.json({
            success: true,
            message: 'Habit health updated successfully',
            data: habitsDoc
        }, { status: 200 })

    } catch (err) {
        console.error('Update error:', err)
        return NextResponse.json(
            {
                success: false,
                message: err instanceof Error ? err.message : 'Server error'
            },
            { status: 500 }
        )
    }
}



