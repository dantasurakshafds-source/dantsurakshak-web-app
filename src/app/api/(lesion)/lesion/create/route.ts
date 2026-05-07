import { NextResponse } from 'next/server';
import { dbConnect } from '@/database/database';
import { uploadPhotoToCloudinary } from '@/utils/Cloudinary';
import { LesionModel } from '@/models/Lesion';
 
export async function POST(request: Request) {
  try {
    await dbConnect();
    const formData = await request.formData();

 
    const fullname = formData.get('fullname') as string;
    const age = Number(formData.get('age'));
    const gender = formData.get('gender') as string;
    const contact_number = formData.get('contact_number') as string;
    const location = formData.get('location') as string;
    const symptoms = formData.get('symptoms') as string;
    const disease_time = formData.get('disease_time') as string;
    const existing_habits = formData.get('existing_habits') as string;
    const previous_dental_treatement = formData.get('previous_dental_treatement') as string;
    const submitted_by = formData.get('submitted_by') as string;

   
    const sendToRaw = formData.get('send_to') as string;
    let send_to: string[] = [];
    if (sendToRaw) {
      try {
        send_to = JSON.parse(sendToRaw);
      } catch (error) {
        if(error instanceof Error){
          send_to = [sendToRaw];
        }
      
      }
    }

 
    const dentalImagesFiles = formData.getAll('dental_images') as File[];
    const dentalImagesUrls: string[] = [];
    for (const file of dentalImagesFiles) {
      if (file instanceof File) {
        const imageUrl = await uploadPhotoToCloudinary(file);
        dentalImagesUrls.push(imageUrl);
      }
    }

  
    const newLesionRecord = new LesionModel({
      fullname,
      age,
      gender,
      contact_number,
      location,
      symptoms,
      disease_time,
      existing_habits,
      previous_dental_treatement,
      submitted_by,  
      send_to,      
      dental_images: dentalImagesUrls,
    });

    await newLesionRecord.save();

    return NextResponse.json(
      {
        message: 'Lesion record created successfully!',
        status:201,
        lesionRecord: newLesionRecord,
      },
      
    );
  } catch (error) {
    if(error instanceof Error){
      return NextResponse.json(
        {
          message: 'Error creating lesion record',
          error: error.message,
        },
        { status: 500 }
      );
    }
 
  }
}
