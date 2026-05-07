import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/database/database'
import Slider from '@/models/Slider'

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const formData = await req.formData()

    const sliderImage = formData.get('sliderImage')?.toString()
    const sliderVideo = formData.get('sliderVideo')?.toString() || undefined

    if (!sliderImage) {
      return NextResponse.json(
        { success: false, message: 'sliderImage is required' },
        { status: 400 }
      )
    }

    const text = JSON.parse(formData.get('text')!.toString())
    const description = JSON.parse(formData.get('description')!.toString())
    const body = JSON.parse(formData.get('body')!.toString())

    const slider = await Slider.create({
      sliderImage,
      sliderVideo,
      text,
      description,
      body,
    })

    return NextResponse.json(
      { success: true, data: slider },
      { status: 201 }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false, message: 'Failed to create slider' },
      { status: 500 }
    )
  }
}
