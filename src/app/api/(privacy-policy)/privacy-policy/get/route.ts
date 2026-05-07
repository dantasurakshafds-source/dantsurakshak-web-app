import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/database/database';
import PrivacyPolicyModel from '@/models/PrivacyPolicy';
import { ReusePaginationMethod } from '@/utils/Pagination';

export async function GET(req:NextRequest) {
  await dbConnect();
  const {page,limit,skip}=ReusePaginationMethod(req)
  const all = await PrivacyPolicyModel.find().skip(skip).limit(limit).lean();
  const totalResults=await PrivacyPolicyModel.countDocuments()
  return NextResponse.json({ success: true, result: all,totalResults,page,limit });
}