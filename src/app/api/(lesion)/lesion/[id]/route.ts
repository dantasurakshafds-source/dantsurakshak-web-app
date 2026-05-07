
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/database/database';
import { uploadPhotoToCloudinary } from '@/utils/Cloudinary';
import { LesionModel } from '@/models/Lesion';
import { Lesion } from '@/utils/Types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const id = (await params).id;
    const lesion = await LesionModel.findById(id)
      .lean();

    if (!lesion) {
      return NextResponse.json(
        { message: 'Lesion not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      status: 200,
      message: 'Lesion retrieved successfully',
      lesion
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { message: 'Error retrieving lesion', error: error.message },
        { status: 500 }
      );
    }
  }
}


export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {

    await dbConnect();

    const id = (await params).id;

    const deletedLesion = await LesionModel.findByIdAndDelete(id);

    if (!deletedLesion) {
      return NextResponse.json(
        { message: 'Lesion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Lesion deleted successfully', status: 200 },

    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { message: 'Error deleting lesion', error: error.message },
        { status: 500 }
      );
    }
  }
}



export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {

    await dbConnect();

    const id = (await params).id;
    if (!id) {
      return NextResponse.json({ error: 'Lesion ID is missing' }, { status: 400 });
    }

    const formData = await req.formData();


    const fullname = formData.get('fullname')?.toString();
    const age = formData.get('age') ? Number(formData.get('age')!.toString()) : undefined;
    const gender = formData.get('gender')?.toString();
    const contact_number = formData.get('contact_number')?.toString();
    const location = formData.get('location')?.toString();
    const symptoms = formData.get('symptoms')?.toString();
    const disease_time = formData.get('disease_time')?.toString();
    const existing_habits = formData.get('existing_habits')?.toString();
    const previous_dental_treatement = formData.get('previous_dental_treatement')?.toString();

    const images = formData.getAll('dental_images')
      .filter((entry): entry is File => entry instanceof File);
    let dental_images: string[] | undefined;
    if (images.length > 0) {
      dental_images = [];
      for (const file of images) {
        const imageUrl = await uploadPhotoToCloudinary(file);
        dental_images.push(imageUrl);
      }
    }


    const updateFields: Partial<Lesion> = {};
    if (fullname !== undefined) updateFields.fullname = fullname;
    if (age !== undefined) updateFields.age = age;
    if (gender !== undefined) updateFields.gender = gender;
    if (contact_number !== undefined) updateFields.contact_number = contact_number;
    if (location !== undefined) updateFields.location = location;
    if (symptoms !== undefined) updateFields.symptoms = symptoms;
    if (disease_time !== undefined) updateFields.disease_time = disease_time;
    if (existing_habits !== undefined) updateFields.existing_habits = existing_habits;
    if (previous_dental_treatement !== undefined) updateFields.previous_dental_treatement = previous_dental_treatement;
    if (dental_images) updateFields.dental_images = dental_images;


    const updatedLesion = await LesionModel.findByIdAndUpdate(id, updateFields, { new: true });
    if (!updatedLesion) {
      return NextResponse.json({ error: 'Lesion not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Lesion updated successfully!',
      lesion: updatedLesion,
    }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({
        error: 'Error updating lesion',
        details: error.message,
        status: 500
      });

    }

  }
}







