 
import { NextRequest, NextResponse } from 'next/server';
 
import { dbConnect } from '@/database/database';
import TermsAndConditionsModel from '@/models/TermsAndConditions';
 

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const formData = await request.formData();
    const repeaterRaw = formData.get('terms_repeater');
    if (!repeaterRaw) throw new Error('Missing terms_repeater');
    const terms_repeater = JSON.parse(repeaterRaw.toString());
    if (!Array.isArray(terms_repeater)) throw new Error('terms_repeater must be an array');

    const newDoc = new TermsAndConditionsModel({ terms_repeater });
    await newDoc.save();
    return NextResponse.json({ success: true, data: newDoc }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    );
  }
}




