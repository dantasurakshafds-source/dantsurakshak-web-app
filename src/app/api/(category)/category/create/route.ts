import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/database/database';
import { uploadPhotoToCloudinary } from '@/utils/Cloudinary';
import Category from '@/models/Category';
 

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const formData = await req.formData();

    
    let featureMainImageUrl = '';
    const featureMainImageFile = formData.get('feature_main_image') as File;
    if (featureMainImageFile) {
      featureMainImageUrl = await uploadPhotoToCloudinary(featureMainImageFile);
    }

    let featureInnerImageUrl = '';
    const featureInnerImageFile = formData.get('feature_inner_image') as File;
    if (featureInnerImageFile) {
      featureInnerImageUrl = await uploadPhotoToCloudinary(featureInnerImageFile);
    }

 
    const feature_main_title = JSON.parse(
      formData.get('feature_main_title')?.toString() || '{}'
    );
    const feature_slug = JSON.parse(
      formData.get('feature_slug')?.toString() || '{}'
    );
    const feature_inner_title = JSON.parse(
      formData.get('feature_inner_title')?.toString() || '{}'
    );
    const feature_inner_description = JSON.parse(
      formData.get('feature_inner_description')?.toString() || '{}'
    );
    const feature_myth_facts_title = JSON.parse(
      formData.get('feature_myth_facts_title')?.toString() || '{}'
    );

 
    const feature_myth_facts_description = JSON.parse(
      formData.get('feature_myth_facts_description')?.toString() || '[]'
    );
    const feature_myths = JSON.parse(
      formData.get('feature_myths')?.toString() || '[]'
    );
    const feature_facts = JSON.parse(
      formData.get('feature_facts')?.toString() || '[]'
    );

    const newCategory = new Category({
      feature_main_title,
      feature_slug,
      feature_main_image: featureMainImageUrl,
      feature_inner_title,
      feature_inner_description,
      feature_inner_image: featureInnerImageUrl,
      feature_myth_facts_title,
      feature_myth_facts_description,
      feature_myths,
      feature_facts
    });

    await newCategory.save();

    return NextResponse.json(
      {status: 201, success: true, message: 'Category created successfully', data: newCategory },
    
    );
  } catch (error) {
    if(error instanceof Error){
      return NextResponse.json(
        { success: false, message: error.message || 'Server error' },
        { status: 500 }
      );
    }
   
  }
}

 
