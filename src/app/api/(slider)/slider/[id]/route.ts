import { dbConnect } from '@/database/database';
import Slider, { ISlider } from '@/models/Slider';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getLanguage } from '@/utils/FilterLanguages';
 
import { SBody } from '@/utils/Types';


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const lang = getLanguage(request)
    await dbConnect();

    const id = (await params).id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid slider ID' }, { status: 400 });
    }

    const slide = await Slider.findById(id).lean<ISlider>().lean();
    if (!slide) {
      return NextResponse.json({ success: false, message: 'Slider not found' }, { status: 404 });
    }

    let localizedData;
    if (lang === 'en' || lang === 'kn') {

      localizedData = {
        _id: slide._id,
        sliderImage: slide.sliderImage,
        sliderVideo: slide.sliderVideo,
        text: { [lang]: slide.text?.[lang] || "" },
        description: { [lang]: slide.description?.[lang] || "" },
        body: slide.body.map((b: SBody) => ({
          image: b.image,
          text: { [lang]: b.text?.[lang] || "" },
          description: { [lang]: b.description?.[lang] || "" },
          _id: b._id
        })),
        createdAt: slide.createdAt,
        updatedAt: slide.updatedAt,
        __v: slide.__v
      };
    } else {
      localizedData = {
        _id: slide._id,
        sliderImage: slide.sliderImage,
        text: slide.text,
        description: slide.description,
        sliderVideo:slide.sliderVideo,
        body: slide.body.map((b: SBody) => ({
          image: b.image,
          text: b.text,
          description: b.description,
          _id: b._id
        })),
        createdAt: slide.createdAt,
        updatedAt: slide.updatedAt,
        __v: slide.__v
      };
    }

    return NextResponse.json({ status: 200, success: true, result: localizedData });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Failed to fetch slider' }, { status: 500 });
  }
}





export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const id = (await params).id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid slider ID' }, { status: 400 });
    }

    const deletedSlide = await Slider.findByIdAndDelete(id);
    if (!deletedSlide) {
      return NextResponse.json({ success: false, message: 'Slider not found' }, { status: 404 });
    }

    return NextResponse.json({ status: 200, success: true, message: 'Slider deleted successfully' });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Failed to delete slider' }, { status: 500 });
  }
}




export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id=(await params).id
  try {
    await dbConnect()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID' },
        { status: 400 }
      )
    }

    const slider = await Slider.findById(id)
    if (!slider) {
      return NextResponse.json(
        { success: false, message: 'Slider not found' },
        { status: 404 }
      )
    }

    const formData = await req.formData()

    const sliderImage = formData.get('sliderImage')?.toString()
    const sliderVideo = formData.get('sliderVideo')?.toString()

    if (sliderImage) slider.sliderImage = sliderImage
    if (sliderVideo) slider.sliderVideo = sliderVideo

    const text = formData.get('text')
    if (text) slider.text = JSON.parse(text.toString())

    const description = formData.get('description')
    if (description) slider.description = JSON.parse(description.toString())

    const body = formData.get('body')
    if (body) slider.body = JSON.parse(body.toString())

    await slider.save()

    return NextResponse.json({
      success: true,
      message: 'Slider updated',
      data: slider,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false, message: 'Update failed' },
      { status: 500 }
    )
  }
}


