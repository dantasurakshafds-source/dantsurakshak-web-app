import { dbConnect } from "@/database/database";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    await dbConnect();

     
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return NextResponse.json(
        { error: "No user found with that email." },
        { status: 404 }
      );
    }

  
    if (user.role !== "super-admin") {
      return NextResponse.json(
        { error: "Not a super-admin account." },
        { status: 403 }
      );
    }

    
    const valid = await bcrypt.compare(password, user.password!);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid password." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        message: "Super-admin login successful.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Super-admin login error:", err);
    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}
