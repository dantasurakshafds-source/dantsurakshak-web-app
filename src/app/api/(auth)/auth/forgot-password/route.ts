import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/database/database";
import { sendApprovalEmail } from "@/utils/Email";
import User from "@/models/User";           
import OtpToken from "@/models/ForgotPassword";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json(
      { error: "Email is required." },
      { status: 400 }
    );
  }

  await dbConnect();

 
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    return NextResponse.json(
      { error: "This email is not registered." },
      { status: 404 }
    );
  }

  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 20 * 60 * 1000);

  await OtpToken.deleteMany({ email });
  await OtpToken.create({ email, otp, expiresAt });

  
  await sendApprovalEmail(
    { email },
    "forgotPassword",
    otp
  );

  return NextResponse.json(
    {
      status: 200,
      message: `OTP sent to your email ${email}. It expires in 20 minutes.`,
    },
    
  );
}
