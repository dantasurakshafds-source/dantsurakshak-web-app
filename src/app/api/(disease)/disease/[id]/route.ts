import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/database/database';
import Disease from '@/models/Disease';
import { EN, KN } from '@/utils/Constants';
import { getLanguage } from '@/utils/FilterLanguages';
import mongoose from 'mongoose';
import { uploadPhotoToCloudinary } from '@/utils/Cloudinary';
import {   DiseaseTypes } from '@/utils/Types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const  id  = (await params).id;
    const lang = getLanguage(request);

    const disease = await Disease.findById(id).lean<DiseaseTypes>();
    if (!disease) {
      return NextResponse.json(
        { success: false, message: 'Disease not found' },
        { status: 404 }
      );
    }

    const localizedDisease = (lang === EN || lang === KN) ? {
      _id: disease._id,
      disease_main_title: { [lang]: disease.disease_main_title?.[lang] || '' },
      disease_main_image: disease.disease_main_image,
      disease_slug: { [lang]: disease.disease_slug?.[lang] || '' },
      disease_title: { [lang]: disease.disease_title?.[lang] || '' },
      disease_description: { [lang]: disease.disease_description?.[lang] || '' },
      disease_icon: disease.disease_icon,
      common_cause_tab_title: { [lang]: disease.common_cause_tab_title?.[lang] || '' },
      common_cause: disease.common_cause?.map(cause => ({
        cause_title: { [lang]: cause.cause_title?.[lang] || '' },
        //@ts-expect-error ignore this 
        cause_repeater: cause.cause_repeater?.map(repeater => ({
          description: { [lang]: repeater.description?.[lang] || '' }
        }))
      })),
      symptoms_tab_title: { [lang]: disease.symptoms_tab_title?.[lang] || '' },
      symptoms: disease.symptoms?.map(symptom => ({
        symptoms_title: { [lang]: symptom.symptoms_title?.[lang] || '' },
         //@ts-expect-error ignore this
        symptoms_repeater: symptom.symptoms_repeater?.map(repeater => ({
          description: { [lang]: repeater.description?.[lang] || '' }
        }))
      })),
      prevention_tips_tab_title: { [lang]: disease.prevention_tips_tab_title?.[lang] || '' },
      prevention_tips: disease.prevention_tips?.map(tip => ({
        prevention_tips_title: { [lang]: tip.prevention_tips_title?.[lang] || '' },
         //@ts-expect-error ignore this
        prevention_tips_repeater: tip.prevention_tips_repeater?.map(repeater => ({
          description: { [lang]: repeater.description?.[lang] || '' }
        }))
      })),
      treatment_option_tab_title: { [lang]: disease.treatment_option_tab_title?.[lang] || '' },
      treatment_option: disease.treatment_option?.map(option => ({
        treatment_option_title: { [lang]: option.treatment_option_title?.[lang] || '' },
         //@ts-expect-error ignore this
        treatment_option_repeater: option.treatment_option_repeater?.map(repeater => ({
          description: { [lang]: repeater.description?.[lang] || '' }
        }))
      })),
      category: disease.category,
      createdAt: disease.createdAt,
      updatedAt: disease.updatedAt,
      __v: disease.__v
    } : disease;

    return NextResponse.json({ 
      success: true, 
      data: localizedDisease 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to fetch disease' },
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
    const deletedDisease = await Disease.findByIdAndDelete(id);
    if (!deletedDisease) {
      return NextResponse.json(
        { success: false, message: 'Disease not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, message: 'Disease deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete disease' },
        { status: 500 }
      );
    }


  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const  id  = (await params).id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }
    const disease = await Disease.findById(id);
    if (!disease) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const parseML = (key: string) => {
      const raw = formData.get(key)?.toString();
      return raw ? JSON.parse(raw) : undefined;
    };
    const parseArray = (key: string) => {
      const raw = formData.get(key)?.toString();
      if (!raw) return null;
      try { return JSON.parse(raw); } catch { throw new Error(`Invalid JSON for ${key}`); }
    };


    const fields = ['disease_main_title', 'disease_slug', 'disease_title', 'disease_description',
      'common_cause_tab_title', 'symptoms_tab_title', 'prevention_tips_tab_title', 'treatment_option_tab_title'];
    for (const key of fields) {
      const val = parseML(key);
      if (val !== undefined) (disease)[key] = val;
    }

    const mainImg = formData.get('disease_main_image') as File;
    if (mainImg?.size) disease.disease_main_image = await uploadPhotoToCloudinary(mainImg);
    const iconFile = formData.get('disease_icon') as File;
    if (iconFile?.size) disease.disease_icon = await uploadPhotoToCloudinary(iconFile);


    const repeaterKeys = ['common_cause', 'symptoms', 'prevention_tips', 'treatment_option'];
    for (const key of repeaterKeys) {
      const arr = parseArray(key);
      if (Array.isArray(arr)) (disease)[key] = arr;
    }

    await disease.save();
    return NextResponse.json({ success: true, status: 200, message: 'Disease updated', data: disease });
  } catch (err) {
    return NextResponse.json({ success: false, message: err instanceof Error ? err.message : 'Update failed' }, { status: 500 });
  }
}





