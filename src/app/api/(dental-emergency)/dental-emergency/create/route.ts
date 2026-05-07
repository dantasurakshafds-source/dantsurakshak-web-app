import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/database/database';
import DentalEmergency from '@/models/DentalEmergency';
import { uploadPhotoToCloudinary } from '@/utils/Cloudinary';
import { DentalEmerRepeater } from '@/utils/Types';


export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const formData = await request.formData();


        const getField = (key: string): string => {
            const value = formData.get(key);
            if (!value) return '';
            if (value instanceof File) {
                throw new Error(`${key} should be a text field, not a file.`);
            }
            return value.toString().trim();
        };


        const parseBilingualField = (key: string): { en: string; kn: string } => {
            const value = getField(key);
            if (!value) return { en: '', kn: '' };
            try {
                return JSON.parse(value);
            } catch (err) {
                throw new Error(`Invalid JSON for field: ${err} - ${key}`);
            }
        };


        const processImageField = async (fileKey: string, textKey: string): Promise<string> => {
            let fileField = formData.get(fileKey);


            if (!fileField || !(fileField instanceof File)) {
                fileField = formData.get(textKey);
            }

            if (fileField && fileField instanceof File) {

                try {
                    const uploadResult = await uploadPhotoToCloudinary(fileField);
                    if (!uploadResult) {

                        throw new Error(`Failed to upload image for field: ${fileKey}`);
                    }

                    return uploadResult;
                } catch (uploadError) {

                    throw new Error(`Error uploading file for field: ${uploadError} - ${fileKey}`);
                }
            }

            const textField = formData.get(textKey);
            if (textField && !(textField instanceof File)) {
                const textValue = textField.toString().trim();
                if (textValue) {

                    return textValue;
                }
            }
            return '';
        };


        const dental_emergency_title = parseBilingualField('dental_emergency_title');
        const dental_emergency_image = await processImageField('dental_emergency_image_file', 'dental_emergency_image');
        const dental_emergency_heading = parseBilingualField('dental_emergency_heading');
        const dental_emergency_para = parseBilingualField('dental_emergency_para');
        const dental_emergency_icon = await processImageField('dental_emergency_icon_file', 'dental_emergency_icon');

        const dental_emergency_inner_title = parseBilingualField('dental_emergency_inner_title');
        const dental_emergency_inner_para = parseBilingualField('dental_emergency_inner_para');
        const dental_emergency_inner_icon = await processImageField('dental_emergency_inner_icon_file', 'dental_emergency_inner_icon');

        const dental_emer_title = parseBilingualField('dental_emer_title');
        const dental_emer_sub_title = parseBilingualField('dental_emer_sub_title');


        const dental_emer_repeater_str = getField('dental_emer_repeater');
        let dental_emer_repeater: DentalEmerRepeater[] = [];
        if (dental_emer_repeater_str) {
            try {
                dental_emer_repeater = JSON.parse(dental_emer_repeater_str);
                if (!Array.isArray(dental_emer_repeater)) {
                    throw new Error('dental_emer_repeater must be an array');
                }
            } catch (err) {
                throw new Error(`Invalid JSON for field: dental_emer_repeater ${err}` );
            }
        }


        const newDentalEmergency = new DentalEmergency({
            dental_emergency_title,
            dental_emergency_image,
            dental_emergency_heading,
            dental_emergency_para,
            dental_emergency_icon,
            dental_emergency_inner_title,
            dental_emergency_inner_para,
            dental_emergency_inner_icon,
            dental_emer_title,
            dental_emer_sub_title,
            dental_emer_repeater,
        });

        await newDentalEmergency.save();

        return NextResponse.json(
            {
                status: 201,
                success: true,
                message: 'Dental Emergency created successfully',
                data: newDentalEmergency,
            },

        );
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { success: false, message: error.message || 'Failed to create Dental Emergency record' },
                { status: 500 }
            );
        }


    }
}
