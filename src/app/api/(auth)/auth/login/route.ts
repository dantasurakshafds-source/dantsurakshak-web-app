import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials } from '@/utils/validateCredentials';
import { signAppToken } from '@/utils/Jwt';
import { Users } from '@/utils/Types';
import { dbConnect } from '@/database/database';
import User from '@/models/User';

interface LoginRequestBody {
  phoneNumber?: string;
  email?: string;
  identifier?: string;
  password?: string;
  fcmToken?: string;
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    console.log('[LOGIN API] Received payload:', { ...body, password: body.password ? '***' : undefined });
    const { phoneNumber, email, identifier, password, fcmToken }: LoginRequestBody = body;

    const targetIdentifier = (identifier || email || phoneNumber || '').trim();
    const cleanPassword = (password || '').trim();

    if (!targetIdentifier) {
      return NextResponse.json(
        { status: 400, error: 'Email or phone number is required' },
        { status: 400 }
      );
    }

    if (!cleanPassword) {
      return NextResponse.json(
        { status: 400, error: 'Password is required' },
        { status: 400 }
      );
    }

    const isEmail = targetIdentifier.includes('@');
    if (!isEmail) {
      const rawDigits = targetIdentifier.replace(/\D/g, '');
      if (rawDigits.slice(-10).length !== 10) {
        return NextResponse.json(
          { status: 400, error: 'Phone number must be a 10-digit number' },
          { status: 400 }
        );
      }
    }

    const user = await validateCredentials(targetIdentifier, cleanPassword) as unknown as Users | null;

    if (!user) {
      return NextResponse.json(
        { status: 401, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if ((user.role === 'admin' || user.role === 'dantasurakshaks') && user.status === 'pending') {
      const token = await signAppToken({
        id: user._id.toString(),
        phoneNumber: user.phoneNumber,
        email: user.email,
        name: user.name,
        role: 'user',
      });

      if (fcmToken) {
        await User.findByIdAndUpdate(user._id, { fcmToken });
      }



      return NextResponse.json({
        status: 200,
        message: 'Logged in with limited user access',
        token,
        user: {
          id: user._id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          email: user.email,
          role: 'user',
          status: user.status
        },
      });
    }

    const token = await signAppToken({
      id: user._id.toString(),
      phoneNumber: user.phoneNumber,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      status: 200,
      message: `${user.name} logged in successfully!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        email: user.email,
        status: user.status
      },
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: 500, error: 'Server error.' },
      { status: 500 }
    );
  }
}