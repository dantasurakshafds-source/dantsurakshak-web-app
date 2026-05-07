import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/database/database';
import PrivacyPolicyModel from '@/models/PrivacyPolicy';
import { IPrivacyPolicyRepeater } from '@/models/PrivacyPolicy';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const id = (await params).id;
    if (!mongoose.isValidObjectId(id)) {
        return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }
    const doc = await PrivacyPolicyModel.findById(id);
    if (!doc) {
        return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, result: doc });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
        return NextResponse.json(
            { success: false, message: 'Invalid ID' },
        );
    }

    try {
        const formData = await request.formData();
        const repeaterRaw = formData.get('privacy_policy_repeater');

        if (!repeaterRaw) {
            return NextResponse.json(
                { success: false, message: 'Missing privacy_policy_repeater' },
            );
        }

        let arr: unknown;
        try {
            arr = JSON.parse(repeaterRaw.toString());
        } catch (e) {
            return NextResponse.json(
                { success: false, message: `Invalid JSON: ${(e as Error).message}` },
            );
        }

        if (!Array.isArray(arr)) {
            return NextResponse.json(
                { success: false, message: 'privacy_policy_repeater must be an array' },
            );
        }

        const updated = await PrivacyPolicyModel.findByIdAndUpdate(
            id,
            { $set: { privacy_policy_repeater: arr as IPrivacyPolicyRepeater[] } },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return NextResponse.json(
                { success: false, message: 'Not found' },
            );
        }

        return NextResponse.json({ success: true, data: updated });
    } catch (err) {
        return NextResponse.json(
            {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error'
            },
        );
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const id = (await params).id;
    if (!mongoose.isValidObjectId(id)) {
        return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }
    const deleted = await PrivacyPolicyModel.findByIdAndDelete(id);
    if (!deleted) {
        return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'privacy policy deleted successfully' });
}
