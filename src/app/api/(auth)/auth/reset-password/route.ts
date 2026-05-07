
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/database/database";
import User from "@/models/User";
import OtpToken from "@/models/ForgotPassword";

export async function POST(req: NextRequest) {
    try {
        const { otp, newPassword, confirmPassword } = await req.json();

       
        if (!otp || !newPassword || !confirmPassword) {
            return NextResponse.json(
                { status: 400, error: "otp, newPassword and confirmPassword are all required." },
                { status: 400 }
            );
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json(
                { status: 400, error: "Passwords do not match." },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { status: 400, error: "Password must be at least 6 characters." },
                { status: 400 }
            );
        }

        await dbConnect();

      
        const tokenDoc = await OtpToken.findOne({ otp });
        if (!tokenDoc) {
            return NextResponse.json(
                { error: "Invalid OTP.", status: 401 },
                { status: 401 }
            );
        }

        if (tokenDoc.expiresAt < new Date()) {
            return NextResponse.json(
                { error: "OTP has expired.", status: 410 },
                { status: 410 }
            );
        }

        const { email } = tokenDoc;

     
        const hashed = await bcrypt.hash(newPassword, 10);
        const user = await User.findOneAndUpdate(
            { email },
            { password: hashed },
            { new: true }
        );

        if (!user) {
            return NextResponse.json(
                { status: 404, error: "No user found with that email." },
                { status: 404 }
            );
        }

     
        await OtpToken.deleteMany({ email });

        return NextResponse.json(
            {
                status: 200,
                message: "Password reset successful.",
                user: { id: user._id, email: user.email, name: user.name },
            },
            { status: 200 }
        );
    } catch (error) {
        if(error instanceof Error){
            return NextResponse.json(
                { status: 500, error: "Internal server error." }, 
            );
        }
  
    }
}