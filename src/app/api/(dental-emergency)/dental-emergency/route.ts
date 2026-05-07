 
import { NextRequest, NextResponse } from 'next/server';
import { EN, KN } from '@/utils/Constants';
import { getLanguage } from '@/utils/FilterLanguages';
import { ReusePaginationMethod } from '@/utils/Pagination';
import { dbConnect } from '@/database/database';
import DentalEmergency from '@/models/DentalEmergency';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const lang = getLanguage(request);
    const { page, skip, limit } = ReusePaginationMethod(request);

    const allDocs = await DentalEmergency.find().limit(limit).skip(skip).lean();
    const totalResults = await DentalEmergency.countDocuments();

    const localizedData = allDocs.map((item) => {
 
    
      if (lang === EN || lang === KN) {
        return {
          _id: item._id,
          dental_emergency_title: { [lang]: item.dental_emergency_title?.[lang] || '' },
          dental_emergency_image: item.dental_emergency_image,
          dental_emergency_heading: { [lang]: item.dental_emergency_heading?.[lang] || '' },
          dental_emergency_para: { [lang]: item.dental_emergency_para?.[lang] || '' },
          dental_emergency_icon: item.dental_emergency_icon,
          dental_emergency_inner_title: { [lang]: item.dental_emergency_inner_title?.[lang] || '' },
          dental_emergency_inner_para: { [lang]: item.dental_emergency_inner_para?.[lang] || '' },
          dental_emergency_inner_icon: item.dental_emergency_inner_icon,
          dental_emer_title: { [lang]: item.dental_emer_title?.[lang] || '' },
          dental_emer_sub_title: { [lang]: item.dental_emer_sub_title?.[lang] || '' },
          dental_emer_repeater: item.dental_emer_repeater,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      }
  
      return item;
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
      return NextResponse.json(
        { status: 500, success: false, message: 'Failed to fetch Dental Emergency documents' },
       
      );
    }
     
  }
}
