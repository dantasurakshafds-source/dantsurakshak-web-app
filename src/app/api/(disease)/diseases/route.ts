import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/database/database';
import { EN, KN } from '@/utils/Constants';
import { getLanguage } from '@/utils/FilterLanguages';
import { ReusePaginationMethod } from '@/utils/Pagination';
import Disease from '@/models/Disease';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const lang = getLanguage(request);
    const { page, skip, limit } = ReusePaginationMethod(request);

    const allDiseases = await Disease.find().limit(limit).skip(skip).sort({ createdAt: -1 }).lean();
    const totalResults = await Disease.countDocuments();

    const localizedData = allDiseases.map((item) => {
      if (lang === EN || lang === KN) {
        return {
          _id: item._id,
          disease_main_title: { [lang]: item.disease_main_title?.[lang] || '' },
          disease_main_image: item.disease_main_image,
          disease_slug: { [lang]: item.disease_slug?.[lang] || '' },
          disease_title: { [lang]: item.disease_title?.[lang] || '' },
          disease_description: { [lang]: item.disease_description?.[lang] || '' },
          disease_icon: item.disease_icon,
          common_cause_tab_title: { [lang]: item.common_cause_tab_title?.[lang] || '' },
          //@ts-expect-error ignore this message
          common_cause: item.common_cause?.map((causeItem) => ({
            cause_title: { [lang]: causeItem.cause_title?.[lang] || '' },
            //@ts-expect-error ignore this message
            cause_repeater: causeItem.cause_repeater?.map((repItem) => ({
              description: { [lang]: repItem.description?.[lang] || '' }
            }))
          })),
          symptoms_tab_title: { [lang]: item.symptoms_tab_title?.[lang] || '' },
          //@ts-expect-error ignore this message
          symptoms: item.symptoms?.map((sympItem) => ({
            symptoms_title: { [lang]: sympItem.symptoms_title?.[lang] || '' },
            //@ts-expect-error ignore this message
            symptoms_repeater: sympItem.symptoms_repeater?.map((repItem) => ({
              description: { [lang]: repItem.description?.[lang] || '' }
            }))
          })),
          prevention_tips_tab_title: { [lang]: item.prevention_tips_tab_title?.[lang] || '' },
          //@ts-expect-error ignore this message
          prevention_tips: item.prevention_tips?.map((prevItem) => ({
            prevention_tips_title: { [lang]: prevItem.prevention_tips_title?.[lang] || '' },
            //@ts-expect-error ignore this message
            prevention_tips_repeater: prevItem.prevention_tips_repeater?.map((repItem) => ({
              description: { [lang]: repItem.description?.[lang] || '' }
            }))
          })),
          treatment_option_tab_title: { [lang]: item.treatment_option_tab_title?.[lang] || '' },
          //@ts-expect-error ignore this message
          treatment_option: item.treatment_option?.map((treatItem) => ({
            treatment_option_title: { [lang]: treatItem.treatment_option_title?.[lang] || '' },
            //@ts-expect-error ignore this message
            treatment_option_repeater: treatItem.treatment_option_repeater?.map((repItem) => ({
              description: { [lang]: repItem.description?.[lang] || '' }
            }))
          })),
          category: item.category,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          __v: item.__v,
        };
      } else {
        return item;
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
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ success: false, message: 'Failed to fetch diseases' }, { status: 500 });
    }
    return NextResponse.json({ success: false, message: 'An unknown error occurred' }, { status: 500 });
  }
}