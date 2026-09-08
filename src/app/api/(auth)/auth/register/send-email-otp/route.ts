import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/database/database";
import { sendApprovalEmail } from "@/utils/Email";
import User from "@/models/User";
import OtpToken from "@/models/ForgotPassword";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { status: 400, error: "Valid email address is required." },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        { status: 409, error: "Email is already registered. Please log in." },
        { status: 409 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes TTL

    const cleanEmail = email.toLowerCase().trim();
    await OtpToken.deleteMany({ email: cleanEmail });
    await OtpToken.create({ email: cleanEmail, otp, expiresAt });

    await sendApprovalEmail(
      { email: cleanEmail },
      "forgotPassword",
      otp
    );

    return NextResponse.json({
      status: 200,
      message: `OTP sent to your email (${cleanEmail}). Valid for 5 minutes.`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to send email verification OTP.";
    return NextResponse.json(
      { status: 500, error: errorMsg },
      { status: 500 }
    );
  }
}
