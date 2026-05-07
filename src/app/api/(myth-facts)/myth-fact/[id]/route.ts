import { dbConnect } from '@/database/database';
import MythFact, { IMythFact } from '@/models/MythFact';
import mongoose from 'mongoose';
import { EN, KN } from '@/utils/Constants';
import { getLanguage } from '@/utils/FilterLanguages';
import { NextRequest, NextResponse } from 'next/server';
import { uploadPhotoToCloudinary } from '@/utils/Cloudinary';
import { IFactsSection, Language } from '@/utils/Types';



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID' },
        { status: 400 }
      );
    }

    const lang = getLanguage(request);
    const item = await MythFact.findById(id).lean<IMythFact>();

    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Not found' },
        { status: 404 }
      );
    }

    if (lang === EN || lang === KN) {
      return NextResponse.json({
        status: 200,
        success: true,
        data: {
          _id: item._id,
          myth_fact_image: item.myth_fact_image,
          myth_fact_title: { [lang]: item.myth_fact_title[lang] || '' },
          myth_fact_body: { [lang]: item.myth_fact_body[lang] || '' },
          myth_fact_heading: { [lang]: item.myth_fact_heading[lang] || '' },
          myth_fact_description: { [lang]: item.myth_fact_description[lang] || '' },


          facts: item.facts.map(section => ({
            heading: { [lang]: section.heading[lang] || '' },
            myths_facts_wrong_fact: section.myths_facts_wrong_fact.map(f => ({ [lang]: f[lang] || '' })),
            myths_facts_right_fact: section.myths_facts_right_fact.map(f => ({ [lang]: f[lang] || '' })),
          })),

          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }
      });
    }

    return NextResponse.json({
      status: 200,
      success: true,
      data: item
    });
  } catch (err) {
    console.error('Get Single MythFact Error:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}


export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();

    const id = (await params).id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }

    const deleted = await MythFact.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: 200,
      success: true,
      message: 'Myth & Fact deleted successfully',
    });

  } catch (error) {
    console.error('Delete MythFact Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete item' }, { status: 500 });
  }
}



export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 })
    }

    // Fetch existing document
    const item = await MythFact.findById(id)
    if (!item) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
    }

    const formData = await req.formData()

    // 1) Handle optional image replacement
    const imageFile = formData.get('myth_fact_image') as File | null
    if (imageFile && imageFile.size > 0) {
      item.myth_fact_image = await uploadPhotoToCloudinary(imageFile)
    }

    // 2) JSON parser helper
    const parseJSON = <T>(key: string): T | null => {
      const raw = formData.get(key)?.toString()
      if (!raw) return null
      try {
        return JSON.parse(raw) as T
      } catch {
        throw new Error(`Invalid JSON for ${key}`)
      }
    }

    // 3) Update top-level localized fields
    const title = parseJSON<Language>('myth_fact_title')
    const body = parseJSON<Language>('myth_fact_body')
    const heading = parseJSON<Language>('myth_fact_heading')
    const description = parseJSON<Language>('myth_fact_description')

    if (title) item.myth_fact_title = title
    if (body) item.myth_fact_body = body
    if (heading) item.myth_fact_heading = heading
    if (description) item.myth_fact_description = description

    // 4) Parse `facts` as an array of sections
    const rawFacts = parseJSON<IFactsSection[]>('facts')
    if (rawFacts) {
      // Validate each section
      for (const section of rawFacts) {
        if (
          !section.heading ||
          !Array.isArray(section.myths_facts_wrong_fact) ||
          !Array.isArray(section.myths_facts_right_fact)
        ) {
          return NextResponse.json(
            { success: false, message: 'Each section needs heading + two arrays' },
            { status: 400 }
          )
        }
      }
      // Replace the entire array
      item.facts = rawFacts
    }

    // 5) Save and respond
    await item.save()
    return NextResponse.json({
      status: 200,
      success: true,
      message: 'Myth & Fact updated successfully',
      data: item
    })
  } catch (err) {
    console.error('Update MythFact Error:', err)
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}