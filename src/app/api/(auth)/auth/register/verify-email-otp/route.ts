import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/database/database";
import OtpToken from "@/models/ForgotPassword";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json(
        { status: 400, error: "Email and OTP are required." },
        { status: 400 }
      );
    }

    await dbConnect();

    const cleanEmail = email.toLowerCase().trim();
    const tokenDoc = await OtpToken.findOne({ email: cleanEmail, otp: String(otp).trim() });

    if (!tokenDoc) {
      return NextResponse.json(
        { status: 400, error: "Invalid OTP code. Please try again." },
        { status: 400 }
      );
    }

    if (tokenDoc.expiresAt < new Date()) {
      return NextResponse.json(
        { status: 410, error: "OTP has expired. Please request a new OTP." },
        { status: 410 }
      );
    }

    // Delete token after successful verification
    await OtpToken.deleteMany({ email: cleanEmail });

    return NextResponse.json({
      status: 200,
      isVerified: true,
      message: "Email verified successfully!",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Verification failed.";
    return NextResponse.json(
      { status: 500, error: errorMsg },
      { status: 500 }
    );
  }
}
