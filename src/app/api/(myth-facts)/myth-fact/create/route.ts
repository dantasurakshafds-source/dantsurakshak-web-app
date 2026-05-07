// pages/api/mythfacts.ts

import { dbConnect } from '@/database/database';
import { uploadPhotoToCloudinary } from '@/utils/Cloudinary';
import MythFact from '@/models/MythFact';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const formData = await req.formData();

    // 1. Upload image
    const imageFile = formData.get('myth_fact_image') as File | null;
    if (!imageFile) {
      return NextResponse.json(
        { success: false, message: 'Image is required' },
        { status: 400 }
      );
    }
    const uploadedImage = await uploadPhotoToCloudinary(imageFile);

    // 2. Helper to parse JSON fields
    const parseJSON = <T>(key: string): T => {
      const raw = formData.get(key)?.toString();
      if (!raw) throw new Error(`Missing field: ${key}`);
      try {
        return JSON.parse(raw) as T;
      } catch {
        throw new Error(`Invalid JSON for field: ${key}`);
      }
    };

    // 3. Parse top-level localized fields
    const myth_fact_title = parseJSON<{ en: string; kn: string }>('myth_fact_title');
    const myth_fact_body = parseJSON<{ en: string; kn: string }>('myth_fact_body');
    const myth_fact_heading = parseJSON<{ en: string; kn: string }>('myth_fact_heading');
    const myth_fact_description = parseJSON<{ en: string; kn: string }>('myth_fact_description');

    // 4. Parse `facts` as an array of sections
    interface FactsSection {
      heading: { en: string; kn: string };
      myths_facts_wrong_fact: { en: string; kn: string }[];
      myths_facts_right_fact: { en: string; kn: string }[];
    }
    const facts = parseJSON<FactsSection[]>('facts');

    // 5. Basic validation: ensure it's an array and each section has proper lists
    if (!Array.isArray(facts)) {
      return NextResponse.json(
        { success: false, message: '`facts` must be an array of sections' },
        { status: 400 }
      );
    }
    for (const section of facts) {
      if (
        !section.heading ||
        !Array.isArray(section.myths_facts_wrong_fact) ||
        !Array.isArray(section.myths_facts_right_fact)
      ) {
        return NextResponse.json(
          { success: false, message: 'Each section must have a heading and two arrays' },
          { status: 400 }
        );
      }
    }

    // 6. Create & save
    const newEntry = await MythFact.create({
      myth_fact_image: uploadedImage,
      myth_fact_title,
      myth_fact_body,
      myth_fact_heading,
      myth_fact_description,
      facts,  // <-- now an array
    });

    return NextResponse.json({
      status: 201,
      success: true,
      message: 'Myth & Fact created',
      data: newEntry,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : 'Server error',
      },
      { status: 500 }
    );
  }
}
