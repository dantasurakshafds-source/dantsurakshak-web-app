
import { NextRequest, NextResponse } from 'next/server';
import Questionnaire from '@/models/Questionnaire';
import { dbConnect } from '@/database/database';
import mongoose from 'mongoose';
import { parseValue } from '@/utils/Constants';
import { QuestionnaireTypes } from '@/utils/Types';
import { uploadPhotoToCloudinary } from '@/utils/Cloudinary';


await dbConnect();


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const questionnaire = await Questionnaire.findById(id)
      .select('+questionary_type +diagnosis_notes +recomanded_actions +comments_or_notes +send_email_to_dantasurakshaks')
      .populate('assignTo', 'name phoneNumber')
      .populate('submitted_by', 'name phoneNumber')
      .lean();

    if (!questionnaire) {
      return NextResponse.json(
        { success: false, message: 'Questionnaire not found' },
        { status: 404 }
      );
    }

    if (questionnaire.send_email_to_dantasurakshaks !== true) {
      delete questionnaire.questionary_type;
      delete questionnaire.diagnosis_notes;
      delete questionnaire.recomanded_actions;
      delete questionnaire.comments_or_notes;
    }

    return NextResponse.json({
      status: 200,
      success: true,
      data: questionnaire,
    });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json(
        { success: false, error: err.message || 'Server error' },
        { status: 500 }
      );
    }
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  try {
    const deletedQuestionnaire = await Questionnaire.findByIdAndDelete(id);
    if (!deletedQuestionnaire) {
      return NextResponse.json(
        { success: false, message: 'Questionnaire not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ status: 200, success: true, message: "questionnaire delete successfully" });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json(
        { success: false, error: err.message || 'Server error' },
        { status: 500 }
      );
    }
  }
}
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const updateData: Partial<QuestionnaireTypes> = {};


    const fields = [
      'demographics', 'name', 'age', 'gender', 'bloodGroup',
      'idCardAvailable', 'cardNumber', 'religion', 'religion_input',
      'education', 'occupation', 'income', 'phoneNumber', 'address',
      'familyHistory', 'firstDegreeRelativeOralCancer',
      'height', 'diabetes', 'hypertension', 'dietHistory',
      'fruitsConsumption', 'vegetableConsumption', 'habitHistory',
      'tobaccoChewer', 'tobaccoType', 'discontinuedHabit',
      'durationOfDiscontinuingHabit', 'otherConsumptionHistory',
      'alcoholConsumption', 'smoking', 'oralCavityExamination',
      'presenceOfLesion', 'reductionInMouthOpening',
      'suddenWeightLoss', 'presenceOfSharpTeeth',
      'presenceOfDecayedTeeth', 'presenceOfFluorosis', 'submitted_by'
    ];

    for (const field of fields) {
      if (formData.has(field)) {
        const raw = formData.get(field)?.toString().trim();
        if (raw) {
          updateData[field as keyof QuestionnaireTypes] = parseValue(field, raw);
        }
      }
    }


    let retainedUrls: string[] = [];
    if (formData.has('existingImages')) {
      try {
        retainedUrls = JSON.parse(formData.get('existingImages') as string);
      } catch {
        return NextResponse.json(
          { success: false, message: 'existingImages must be valid JSON array' },

        );
      }
    }


    const blobs = formData.getAll('images') as Blob[];
    const uploadedUrls: string[] = [];
    for (const blob of blobs.slice(0, 5)) {
      const url = await uploadPhotoToCloudinary(blob);
      uploadedUrls.push(url);
    }


    updateData.images = [...retainedUrls, ...uploadedUrls];


    if (formData.has('presenceOfGumDisease')) {
      const gumRaw = formData.get('presenceOfGumDisease')?.toString().trim() || '';
      updateData.presenceOfGumDisease = gumRaw
        ? gumRaw.split(',').map(v => v.trim()).filter(Boolean)
        : [];
    }


    const updatedDoc = await Questionnaire.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedDoc) {
      return NextResponse.json(
        { status: 404, success: false, message: 'Questionnaire not found' },

      );
    }

    return NextResponse.json({ success: true, data: updatedDoc, status: 200 });
  } catch (err) {
    if (err instanceof Error) {
      const message = err instanceof Error ? err.message : 'Failed to update questionnaire';
      return NextResponse.json({ success: false, message });
    }

  }
}








