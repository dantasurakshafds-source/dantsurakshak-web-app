import { dbConnect } from '@/database/database';
import Category from '@/models/Category';
import { EN, KN } from '@/utils/Constants';
import { getLanguage } from '@/utils/FilterLanguages';
import { ReusePaginationMethod } from '@/utils/Pagination';
import { DiseaseTypes, MythOrFactItem } from '@/utils/Types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const lang = getLanguage(request);
    const { page, skip, limit } = ReusePaginationMethod(request);

    const categories = await Category.find()
      .limit(limit)
      .skip(skip)
      .lean();

    const totalResults = await Category.countDocuments();

    const localizedData = categories.map((category) => {

      if (lang === EN || lang === KN) {
        return {
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
            ? category.diseases.map((disease: DiseaseTypes) => ({
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
          __v: category.__v,
        };
      } else {
        return {
          ...category,
        };
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
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json(
        { status: 500, success: false, message: 'Failed to fetch categories' },

      );
    }
  }
}
