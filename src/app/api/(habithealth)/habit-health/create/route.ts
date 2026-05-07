import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/database/database'
import HabitsHealth from '@/models/HabitsHealth'
import { uploadPhotoToCloudinary } from '@/utils/Cloudinary'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const formData = await request.formData()

  
    const rawTitle = formData.get('habit_health_main_title')?.toString()
    if (!rawTitle) throw new Error('Missing field: habit_health_main_title')
    const habit_health_main_title = JSON.parse(rawTitle)
    if (
      typeof habit_health_main_title.en !== 'string' ||
      typeof habit_health_main_title.kn !== 'string' ||
      !habit_health_main_title.en.trim() ||
      !habit_health_main_title.kn.trim()
    ) {
      throw new Error('Both en and kn are required for habit_health_main_title')
    }

 
    const file = formData.get('habit_health_main_image')
    if (!(file instanceof Blob)) {
      throw new Error('Missing or invalid field: habit_health_main_image')
    }
    const habit_health_main_image = await uploadPhotoToCloudinary(file)

 
    const repeaterRaw = formData.get('habit_health_repeater')?.toString()
    if (!repeaterRaw) throw new Error('Missing field: habit_health_repeater')
    const repeaterArray = JSON.parse(repeaterRaw)
    if (!Array.isArray(repeaterArray)) throw new Error('habit_health_repeater must be an array')

    const habit_health_repeater = repeaterArray.map((item, i) => {
    
      if (!item.description || !Array.isArray(item.description)) {
        throw new Error(`Repeater item ${i}: Missing description array`)
      }
      
      const firstDescription = item.description[0]
      if (
        !firstDescription ||
        typeof firstDescription.en !== 'string' ||
        typeof firstDescription.kn !== 'string' ||
        !firstDescription.en.trim() ||
        !firstDescription.kn.trim()
      ) {
        throw new Error(`Repeater item ${i}: Both en and kn are required for description`)
      }
      
      return {
        description: [{
          en: firstDescription.en.trim(),
          kn: firstDescription.kn.trim()
        }]
      }
    })

    // 4. Save
    const doc = new HabitsHealth({
      habit_health_main_title,
      habit_health_main_image,
      habit_health_repeater,
    })
    await doc.save()

    return NextResponse.json({ success: true, data: doc }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { success: false, message: (err as Error).message },
      { status: 400 }
    )
  }
}