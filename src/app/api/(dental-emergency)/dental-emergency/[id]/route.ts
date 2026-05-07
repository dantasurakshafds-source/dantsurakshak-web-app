
import { NextRequest, NextResponse } from 'next/server';
import { EN, KN } from '@/utils/Constants';
import { getLanguage } from '@/utils/FilterLanguages';
import { dbConnect } from '@/database/database';
import DentalEmergency from '@/models/DentalEmergency';
import { DentalEmergencyTypes, DentalEmerRepeater } from '@/utils/Types';
import mongoose from 'mongoose';
import { uploadPhotoToCloudinary } from '@/utils/Cloudinary';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}


export async function GET(request: NextRequest, { params }: RouteContext) {
    try {
        await dbConnect();
        const id = (await params).id;
        const lang = getLanguage(request);
        const doc = (await DentalEmergency.findById(id).lean()) as DentalEmergencyTypes | null;
        if (!doc) {
            return NextResponse.json(
                { status: 404, success: false, message: 'Dental Emergency not found' },

            );
        }
        let localizedDoc;
        if (lang === EN || lang === KN) {
            localizedDoc = {
                _id: doc._id,
                dental_emergency_title: { [lang]: doc.dental_emergency_title?.[lang] || '' },
                dental_emergency_image: doc.dental_emergency_image,
                dental_emergency_heading: { [lang]: doc.dental_emergency_heading?.[lang] || '' },
                dental_emergency_para: { [lang]: doc.dental_emergency_para?.[lang] || '' },
                dental_emergency_icon: doc.dental_emergency_icon,
                dental_emergency_inner_title: { [lang]: doc.dental_emergency_inner_title?.[lang] || '' },
                dental_emergency_inner_para: { [lang]: doc.dental_emergency_inner_para?.[lang] || '' },
                dental_emergency_inner_icon: doc.dental_emergency_inner_icon,
                dental_emer_title: { [lang]: doc.dental_emer_title?.[lang] || '' },
                dental_emer_sub_title: { [lang]: doc.dental_emer_sub_title?.[lang] || '' },
                dental_emer_repeater: doc.dental_emer_repeater,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            };
        } else {
            localizedDoc = doc;
        }
        console.log(`localizedDoc`)
        console.log(localizedDoc)

        return NextResponse.json(
            { status: 200, success: true, result: localizedDoc },
        );
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { status: 500, success: false, message: error.message },
            );
        }
    }
}


export async function DELETE(request: NextRequest, { params }: RouteContext) {
    try {
        await dbConnect();
        const id = (await params).id;
        const deletedDoc = await DentalEmergency.findByIdAndDelete(id).lean();
        if (!deletedDoc) {
            return NextResponse.json(
                { status: 404, success: false, message: 'Dental Emergency not found' },

            );
        }
        return NextResponse.json(
            { status: 200, success: true, message: 'Dental Emergency deleted successfully' }

        );
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { status: 500, success: false, message: error.message }
            );
        }

    }
}






export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const id = (await params).id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
        }
        const formData = await req.formData();
        const updateData: Partial<DentalEmergencyTypes> = {};
        const parseLang = (key: keyof DentalEmergencyTypes) => {
            const raw = formData.get(key)?.toString();
            if (!raw) return;
            try {
                const { en = '', kn = '' } = JSON.parse(raw);
                //@ts-expect-error ignore this line of code
                updateData[key] = { en, kn }
            } catch (e) {
                throw new Error(`Invalid JSON for ${key}: ${e}`);
            }
        };


        parseLang('dental_emergency_title');
        parseLang('dental_emergency_heading');
        parseLang('dental_emergency_para');
        parseLang('dental_emergency_inner_title');
        parseLang('dental_emergency_inner_para');
        parseLang('dental_emer_title');
        parseLang('dental_emer_sub_title');


        const repRaw = formData.get('dental_emer_repeater')?.toString();
        if (repRaw) {
            try {
                const arr = JSON.parse(repRaw);
                if (!Array.isArray(arr)) throw new Error('Must be an array');
                updateData.dental_emer_repeater = arr as DentalEmerRepeater[];
            } catch (e) {
                throw new Error(`Invalid JSON for dental_emer_repeater: ${e}`);
            }
        }


        const processImg = async <K extends keyof DentalEmergencyTypes>(
            fileKey: string,
            docKey: K
        ) => {
            const file = formData.get(fileKey);
            if (file instanceof File && file.size > 0) {
                updateData[docKey] = (await uploadPhotoToCloudinary(file)) as  DentalEmergencyTypes[typeof docKey];
            }
        };


        await processImg('dental_emergency_image_file', 'dental_emergency_image');
        await processImg('dental_emergency_icon_file', 'dental_emergency_icon');
        await processImg('dental_emergency_inner_icon_file', 'dental_emergency_inner_icon');

        const updated = await DentalEmergency.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        if (!updated) {
            return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Updated successfully',
            data: updated
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, message: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 }
        );
    }
}








