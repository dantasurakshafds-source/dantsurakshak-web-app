import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { requestId, otp } = await request.json();
    const otplessUrl = process.env.NEXT_PUBLIC_OTPLESS_URL;
    const clientId = process.env.NEXT_PUBLIC_OTPLESS_C_ID;
    const clientSecret = process.env.NEXT_PUBLIC_OTPLESS_C_SEC;
    if (!otplessUrl || !clientId || !clientSecret) {
        return NextResponse.json(
            { error: "Missing environment configuration" },
            { status: 500 }
        );
    }
    try {
        const response = await fetch(`${otplessUrl}/auth/v1/verify/otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                clientId,
                clientSecret,
            },
            body: JSON.stringify({ requestId, otp }),
        });
        const result = await response.json();
        
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return NextResponse.json(
            {status: 500, error: "Internal server issue" },
            
        );
    }
}
