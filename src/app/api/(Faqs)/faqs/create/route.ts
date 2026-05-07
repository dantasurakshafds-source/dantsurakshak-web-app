import { dbConnect } from "@/database/database";
import FaqModel from "@/models/Faqs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    await dbConnect();
    try {
        const formData = await request.formData();

        const getField = (key: string): string => {
            const value = formData.get(key);
            if (value === null) {
                throw new Error(`Missing field: ${key}`);
            }
            return value.toString();
        };
        const faqs_title = JSON.parse(getField("faqs_title"));
        const faqs_repeater = JSON.parse(getField("faqs_repeater"));
        if (!faqs_title.en || !faqs_title.kn) {
            throw new Error("Both English and Kannada titles are required");
        }
        const newFaq = new FaqModel({
            faqs_title,
            faqs_repeater,
        });

        await newFaq.save();

        return NextResponse.json({
            status: 201,
            success: true,
            data: newFaq
        });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                {
                    success: false,
                    error: error.message || "An error occurred"
                },
                { status: 400 }
            );
        }
        return NextResponse.json(
            {
                success: false,
                error: "Unknown error occurred"
            },
           
        );
    }
}

