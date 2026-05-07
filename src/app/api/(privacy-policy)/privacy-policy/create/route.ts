import { NextResponse } from 'next/server';
import { dbConnect } from '@/database/database';
import PrivacyPolicy from '@/models/PrivacyPolicy';
 

 
export async function POST(request: Request) {
  await dbConnect();
  try {
    const formData = await request.formData();
    const repeaterRaw = formData.get('privacy_policy_repeater');
    if (!repeaterRaw) {
      throw new Error('Missing privacy_policy_repeater');
    }
    const privacy_policy_repeater = JSON.parse(repeaterRaw.toString());
    if (!Array.isArray(privacy_policy_repeater)) {
      throw new Error('privacy_policy_repeater must be an array');
    }
    const newDoc = new PrivacyPolicy({ privacy_policy_repeater });
    await newDoc.save();
    return NextResponse.json({ success: true, data: newDoc }, { status: 201 });
  } catch (err) {
    if(err instanceof Error){
        return NextResponse.json(
          { success: false, error: err instanceof Error ? err.message : 'Unknown' }, 
        );
    }
  }
}
