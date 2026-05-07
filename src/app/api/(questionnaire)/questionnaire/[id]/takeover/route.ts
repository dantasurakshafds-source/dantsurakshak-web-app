import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/database/database';
import Questionnaire from '@/models/Questionnaire';
import { Types } from 'mongoose';

 
interface AssignToUser {
  _id: Types.ObjectId;
  name: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const id = (await params).id;
  const { adminId } = (await request.json()) as { adminId?: string };
  if (!adminId) {
    return NextResponse.json(
      { status: 400, message: 'adminId is required in request body' }
    );
  }
  try {
    const taken = await Questionnaire.findOneAndUpdate(
      { _id: id, adminAction: false },
      { $set: { adminAction: true, assignTo: adminId } },
      { new: true }
    );
    if (taken) {
      return NextResponse.json({
        message: 'Questionnaire taken over successfully',
        status: 200
      });
    }
    const existing = await Questionnaire.findById(id)
      .populate<{ assignTo: AssignToUser }>('assignTo', 'name')
      .lean();
    if (!existing) {
      return NextResponse.json(
        { status: 404, message: 'Questionnaire not found' }
      );
    }
    const takerName = existing.assignTo?.name || 'another admin';
    return NextResponse.json(
      {
        message: `Already taken over by ${takerName}`,
        status: 400
      }
    );
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json(
        { message: 'Error taking over', error: err.message, status: 500 }
      );
    }
  }
}