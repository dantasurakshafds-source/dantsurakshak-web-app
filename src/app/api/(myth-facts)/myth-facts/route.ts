

import { dbConnect } from '@/database/database';
import MythFact from '@/models/MythFact';
import { EN, KN } from '@/utils/Constants';
import { getLanguage } from '@/utils/FilterLanguages';
import { ReusePaginationMethod } from '@/utils/Pagination';
import { Section } from '@/utils/Types';
import { NextRequest, NextResponse } from 'next/server';
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const lang = getLanguage(request);
    const { page, skip, limit } = ReusePaginationMethod(request);
    const allFacts = await MythFact.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const totalResults = await MythFact.countDocuments();
    const localized = allFacts.map(item => {
      if (lang === EN || lang === KN) {
        return {
          _id: item._id,
          myth_fact_image: item.myth_fact_image,
          myth_fact_title: { [lang]: item.myth_fact_title?.[lang] || '' },
          myth_fact_body: { [lang]: item.myth_fact_body?.[lang] || '' },
          myth_fact_heading: { [lang]: item.myth_fact_heading?.[lang] || '' },
          myth_fact_description: { [lang]: item.myth_fact_description?.[lang] || '' },
          facts: item.facts.map((section: Section) => ({
            heading: { [lang]: section.heading[lang] || '' },
            myths_facts_wrong_fact: section.myths_facts_wrong_fact.map(f => ({ [lang]: f[lang] || '' })),
            myths_facts_right_fact: section.myths_facts_right_fact.map(f => ({ [lang]: f[lang] || '' })),
          })),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          __v: item.__v,
        };
      }
      return item;
    });
    return NextResponse.json({
      status: 200,
      success: true,
      result: localized,
      totalResults,
      page,
      limit,
    });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch myths & facts' },
      );
    }
  }
}
