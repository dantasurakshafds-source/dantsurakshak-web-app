import { dbConnect } from '@/database/database';
import Category from '@/models/Category';
import Disease from '@/models/Disease';

import { uploadPhotoToCloudinary } from '@/utils/Cloudinary';
import { EN, KN } from '@/utils/Constants';
import { getLanguage } from '@/utils/FilterLanguages';
import { CategoryDiseaseTypes, FeatureSchema, Language, MythOrFactItem } from '@/utils/Types';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    await dbConnect();
    const lang = getLanguage(request);
    const category = (await Category.findById(id)
     .populate({
        path: 'diseases', 
        select: '_id disease_main_title disease_main_image disease_slug',
      })
      .lean()) as FeatureSchema | null;

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }
    let localizedCategory;

    if (lang === EN || lang === KN) {
      localizedCategory = {
        _id: category._id,
        categoryImage: category.categoryImage,

        feature_main_title: category.feature_main_title
          ? { [lang]: category.feature_main_title[lang] || '' }
          : {},
        feature_slug: category.feature_slug
          ? { [lang]: category.feature_slug[lang] || '' }
          : {},
        feature_inner_title: category.feature_inner_title
          ? { [lang]: category.feature_inner_title[lang] || '' }
          : {},
        feature_inner_description: category.feature_inner_description
          ? { [lang]: category.feature_inner_description[lang] || '' }
          : {},
        feature_myth_facts_title: category.feature_myth_facts_title
          ? { [lang]: category.feature_myth_facts_title[lang] || '' }
          : {},



        feature_myth_facts_description: category.feature_myth_facts_description
          ? { [lang]: category.feature_myth_facts_description[lang] || '' }
          : {},

        feature_myths: Array.isArray(category.feature_myths)
          ? category.feature_myths.map((item: MythOrFactItem) => ({
            para: { [lang]: item.para[lang] || '' },
            icon: item.icon
          }))
          : [],
        feature_facts: Array.isArray(category.feature_facts)
          ? category.feature_facts.map((item: MythOrFactItem) => ({
            para: { [lang]: item.para[lang] || '' },
            icon: item.icon
          }))
          : [],
        diseases: Array.isArray(category.diseases)
          ? category.diseases.map((disease: CategoryDiseaseTypes) => ({
            _id: disease._id,
            disease_main_title: disease.disease_main_title
              ? { [lang]: disease.disease_main_title[lang] || '' }
              : {},
            disease_main_image: disease.disease_main_image || '',
            disease_slug: disease.disease_slug
              ? { [lang]: disease.disease_slug[lang] || '' }
              : {},
          }))
          : [],

        feature_main_image: category.feature_main_image,
        feature_inner_image: category.feature_inner_image,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        __v: category.__v
      };
    } else {
      localizedCategory = category;
    }

    return NextResponse.json({
      status: 200,
      success: true,
      data: localizedCategory
    });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch category' },
        { status: 500 }
      );
    }
  }
}







export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const id = (await params).id


    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Category ID' },
        { status: 400 }
      )
    }


    const deleted = await Category.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      )
    }

    const result = await Disease.updateMany(
      { category: new mongoose.Types.ObjectId(id) },
      { $unset: { category: null } }
    )


    return NextResponse.json({
      status: 200,
      success: true,
      message: 'Category deleted and Diseases updated',
      details: {
        diseasesMatched: result.matchedCount,
        diseasesModified: result.modifiedCount,
      },
    })
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete category' },
        { status: 500 }
      )

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
        { success: false, message: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    const formData = await req.formData();


    const featureMainImageFile = formData.get('feature_main_image') as File | null;
    if (featureMainImageFile && featureMainImageFile.size > 0) {
      const newFeatureMainImageUrl = await uploadPhotoToCloudinary(featureMainImageFile);
      category.feature_main_image = newFeatureMainImageUrl;
    }

    const featureInnerImageFile = formData.get('feature_inner_image') as File | null;
    if (featureInnerImageFile && featureInnerImageFile.size > 0) {
      const newFeatureInnerImageUrl = await uploadPhotoToCloudinary(featureInnerImageFile);
      category.feature_inner_image = newFeatureInnerImageUrl;
    }


    const updateBilingualField = (fieldName: string) => {
      const fieldJson = formData.get(fieldName)?.toString();
      if (fieldJson) {
        try {
          const parsed = JSON.parse(fieldJson);

          const bilingualFields = category as Record<string, Language>;
          if (parsed.en !== undefined) {
            bilingualFields[fieldName].en = parsed.en;
          }
          if (parsed.kn !== undefined) {
            bilingualFields[fieldName].kn = parsed.kn;
          }
        } catch (err) {
          if (err instanceof Error) {
            throw new Error(`Invalid ${fieldName} JSON`);
          }
        }
      }
    };



    updateBilingualField('feature_main_title');
    updateBilingualField('feature_slug');
    updateBilingualField('feature_inner_title');
    updateBilingualField('feature_inner_description');
    updateBilingualField('feature_myth_facts_title');
    updateBilingualField('feature_myth_facts_description');





    const featureMythsJson = formData.get('feature_myths')?.toString();
    if (featureMythsJson) {
      try {
        const parsedArray = JSON.parse(featureMythsJson);
        if (!Array.isArray(parsedArray))
          throw new Error('feature_myths must be an array');

        const updatedMyths = await Promise.all(
          parsedArray.map(async (item: MythOrFactItem, index: number) => {

            const mythImageFile = formData.get(`mythImage${index}`) as File | null;
            let icon = item.icon;
            if (mythImageFile && mythImageFile.size > 0) {
              icon = await uploadPhotoToCloudinary(mythImageFile);
            }
            return {
              para: item.para,
              icon,
            };
          })
        );
        category.feature_myths = updatedMyths;
      } catch (err) {
        if (err instanceof Error) {
          return NextResponse.json(
            { success: false, message: 'Invalid feature_myths JSON' },
            { status: 400 }
          );
        }
      }
    }


    const featureFactsJson = formData.get('feature_facts')?.toString();
    if (featureFactsJson) {
      try {
        const parsedArray = JSON.parse(featureFactsJson);
        if (!Array.isArray(parsedArray))
          throw new Error('feature_facts must be an array');
        const updatedFacts = await Promise.all(
          parsedArray.map(async (item: MythOrFactItem, index: number) => {

            const factImageFile = formData.get(`factImage${index}`) as File | null;
            let icon = item.icon;
            if (factImageFile && factImageFile.size > 0) {
              icon = await uploadPhotoToCloudinary(factImageFile);
            }
            return {
              para: item.para,
              icon,
            };
          })
        );
        category.feature_facts = updatedFacts;
      } catch (err) {
        if (err instanceof Error) {
          return NextResponse.json(
            { success: false, message: 'Invalid feature_facts JSON' },
            { status: 400 }
          );

        }
      }
    }

    await category.save();

    return NextResponse.json({
      status: 200,
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json(
        { success: false, message: err.message || 'Failed to update category' },
        { status: 500 }
      );
    }
  }
}


