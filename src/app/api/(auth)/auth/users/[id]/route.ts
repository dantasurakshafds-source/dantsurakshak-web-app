


import { dbConnect } from '@/database/database';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import VerificationToken from '@/models/VerificationToken';
import { sendApprovalEmail } from '@/utils/Email';
import { Users } from '@/utils/Types';
import User from '@/models/User';



 
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  await dbConnect()
  if (!id) {
    return NextResponse.json({ error: 'User ID is missing' }, { status: 400 });
  }
  const user = await User.findOne({ _id: id });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'User retrieved successfully', user });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  await dbConnect()
  if (!id) {
    return NextResponse.json({ error: 'User ID is missing' }, { status: 400 });
  }
  const user = await User.findOne({ _id: id });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  await user.deleteOne()
  return NextResponse.json({ message: 'User deleted successfully' });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  const body = await req.json();
  const { name, email, password, role, status: newStatus } = body;
  await dbConnect();
  if (!id) {
    return NextResponse.json({ error: 'User ID is missing' }, { status: 400 });
  }
  if (body.phoneNumber !== undefined) {
    return NextResponse.json(
      { error: 'Phone number cannot be changed.' },
      { status: 400 }
    );
  }
  const currentUser = await User.findById(id);
  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  if (
    newStatus !== undefined &&
    currentUser.status === 'approved' &&
    newStatus !== currentUser.status
  ) {
    return NextResponse.json(
      { error: 'Cannot change status once it is approved.' },
      { status: 400 }
    );
  }
  const updateFields: Partial<Users> = {};


  if (name !== undefined) updateFields.name = name;
  if (email !== undefined) {
    if (email !== currentUser.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return NextResponse.json(
          { error: 'Email is already in use' },
          { status: 400 }
        );
      }
      updateFields.email = email;
    }
  }
  if (password) {
    updateFields.password = await bcrypt.hash(password, 10);
  }
  if (role && role !== currentUser.role) {
    updateFields.role = role;
  }
  if (newStatus !== undefined && newStatus !== currentUser.status) {
    updateFields.status = newStatus;
  }

  const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
    new: true,
  });

  if (
    updateFields.status === 'approved' &&
    (updatedUser?.role === 'admin' || updatedUser?.role === 'dantasurakshaks')
  ) {
    const token = crypto.randomBytes(32).toString('hex');
    await VerificationToken.create({
      userId: updatedUser._id,
      token,
      createdAt: new Date(),
    });
      //@ts-expect-error error comes due to severl reason
    const emailUser: Users = {
      //@ts-expect-error error comes due to severl reason
      _id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      phoneNumber: Number(updatedUser.phoneNumber),
      password: updatedUser.password,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
      status: updatedUser.status,
       
    };
    await sendApprovalEmail(emailUser, 'register', token);
  }
  return NextResponse.json({
    message: 'User updated successfully',
    user: updatedUser,
  });
}










