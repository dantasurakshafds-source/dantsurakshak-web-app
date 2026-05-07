
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/database/database';
import { uploadPhotoToCloudinary } from '@/utils/Cloudinary';
import Disease from '@/models/Disease';

import Category from '@/models/Category';
import mongoose from 'mongoose';
import { CauseItem, PreventionTipsItem, SymptomsItem, TreatmentOptionItem } from '@/utils/Types';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const formData = await req.formData();

    const parseML = (key: string) => {
      const raw = formData.get(key)?.toString();
      return raw ? JSON.parse(raw) : undefined;
    };


    const disease_main_title = parseML('disease_main_title');
    let disease_main_image = '';
    const mainImg = formData.get('disease_main_image') as File;
    if (mainImg?.name) disease_main_image = await uploadPhotoToCloudinary(mainImg);

    const disease_slug = parseML('disease_slug');
    const disease_title = parseML('disease_title');
    const disease_description = parseML('disease_description');

    let disease_icon = '';
    const iconFile = formData.get('disease_icon') as File;
    if (iconFile?.name) disease_icon = await uploadPhotoToCloudinary(iconFile);


    const common_cause_tab_title = parseML('common_cause_tab_title');
    const symptoms_tab_title = parseML('symptoms_tab_title');
    const prevention_tips_tab_title = parseML('prevention_tips_tab_title');
    const treatment_option_tab_title = parseML('treatment_option_tab_title');


    const parseArray = (key: string) => {
      const raw = formData.get(key)?.toString();
      if (!raw) return [];
      try { return JSON.parse(raw); } catch { throw new Error(`Invalid JSON for ${key}`); }
    };

    const common_cause = parseArray('common_cause').map((item: CauseItem) => ({
      ...item,
      cause_repeater: item.cause_repeater || []
    }));
    const symptoms = parseArray('symptoms').map((item: SymptomsItem) => ({
      ...item,
      symptoms_repeater: item.symptoms_repeater || []
    }));
    const prevention_tips = parseArray('prevention_tips').map((item: PreventionTipsItem) => ({
      ...item,
      prevention_tips_repeater: item.prevention_tips_repeater || []
    }));
    const treatment_option = parseArray('treatment_option').map((item: TreatmentOptionItem) => ({
      ...item,
      treatment_option_repeater: item.treatment_option_repeater || []
    }));


    const category = formData.get('category')?.toString();
    if (!category) return NextResponse.json({ success: false, message: 'Category ID required' }, { status: 400 });
    if (!mongoose.Types.ObjectId.isValid(category)) return NextResponse.json({ success: false, message: 'Invalid Category ID' }, { status: 400 });
    if (!await Category.exists({ _id: category })) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    }

    const newDoc = new Disease({
      disease_main_title,
      disease_main_image,
      disease_slug,
      disease_title,
      disease_description,
      disease_icon,
      common_cause_tab_title,
      common_cause,
      symptoms_tab_title,
      symptoms,
      prevention_tips_tab_title,
      prevention_tips,
      treatment_option_tab_title,
      treatment_option,
      category
    });
    await newDoc.save();
    await Category.findByIdAndUpdate(category, { $push: { diseases: newDoc._id } });

    return NextResponse.json({ success: true, status: 201, message: 'Disease created', data: newDoc });
  } catch (err) {
    return NextResponse.json({ success: false, message: err instanceof Error ? err.message : 'Creation failed' }, { status: 500 });
  }
}
