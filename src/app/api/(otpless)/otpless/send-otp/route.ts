import { NextRequest, NextResponse } from "next/server";

interface OTPRequestBody {
    phoneNumber: string;
    channels?: string[];
    otpLength?: number;
    expiry?: number;
}


export async function POST(request: NextRequest) {
    try {
        const { phoneNumber, channels = ['SMS'], otpLength = 6, expiry = 7200 } =
            (await request.json()) as OTPRequestBody;

        const otplessUrl = process.env.NEXT_PUBLIC_OTPLESS_URL;
        const clientId = process.env.NEXT_PUBLIC_OTPLESS_C_ID;
        const clientSecret = process.env.NEXT_PUBLIC_OTPLESS_C_SEC;
        if (!otplessUrl || !clientId || !clientSecret) {
            return NextResponse.json(
                { status: 500, error: 'Missing environment configuration' },

            );
        }

        const response = await fetch(`${otplessUrl}/auth/v1/initiate/otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                clientId,
                clientSecret,
            },
            body: JSON.stringify({
                phoneNumber,
                channels,
                otpLength,
                expiry,
            }),
        });

        const result = await response.json();
        console.log(result);
        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { status: 500, error: 'Internal server issue' },
            );
        }
    }
}
