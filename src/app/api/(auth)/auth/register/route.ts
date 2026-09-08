import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/database/database'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { signAppToken } from '@/utils/Jwt'
import { sendApprovalEmail } from '@/utils/Email'
import { createVerificationToken } from '@/utils/Constants'
import { Users } from '@/utils/Types'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phoneNumber, role, fcmToken } = await req.json()
    if (!name || !email || !password || !phoneNumber) {
      return NextResponse.json(
        { status: 400, error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Phone number validation: must be a 10-digit number
    const cleanPhoneDigits = String(phoneNumber).replace(/\D/g, '')
    if (cleanPhoneDigits.slice(-10).length !== 10) {
      return NextResponse.json(
        { status: 400, error: 'Phone number must be a 10-digit number' },
        { status: 400 }
      )
    }

    // Password length validation: min 8, max 26 characters
    if (password.length < 8 || password.length > 26) {
      return NextResponse.json(
        { status: 400, error: 'Password must be between 8 and 26 characters long' },
        { status: 400 }
      )
    }

    // Password strength: uppercase, lowercase, number, special char (e.g. !Aa7)
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      return NextResponse.json(
        { status: 400, error: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (e.g. !Aa7)' },
        { status: 400 }
      )
    }

    await dbConnect()

    if (await User.findOne({ email })) {
      return NextResponse.json(
        { status: 409, error: 'Email already in use' },
        { status: 409 }
      )
    }
    const last10Digits = cleanPhoneDigits.slice(-10)
    const existingPhone = await User.findOne({
      $or: [
        { phoneNumber: String(phoneNumber).trim() },
        { phoneNumber: last10Digits },
        { phoneNumber: `+91${last10Digits}` },
        { phoneNumber: `91${last10Digits}` },
        { phoneNumber: Number(last10Digits) },
        { phoneNumber: Number(`91${last10Digits}`) },
      ],
    })
    if (existingPhone) {
      return NextResponse.json(
        { status: 409, error: 'Phone number already in use' },
        { status: 409 }
      )
    }

    const finalRole = role || 'user'
    let status: 'approved' | 'pending' = 'approved'
    if (finalRole === 'admin' || finalRole === 'dantasurakshaks') {
      status = 'pending'
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role: finalRole,
      status,
      isVerified: true,
      fcmToken: fcmToken || "",
    })

    const newUserObj = newUser.toObject()
    const userToSend: Users = {
      ...newUserObj,
      _id: String(newUserObj._id),
      phoneNumber: Number(newUserObj.phoneNumber),
    }

 
    const superAdmins = await User.find({ role: 'super-admin' }).select('email')
    const superAdminEmails = superAdmins.map(admin => admin.email)

 
    if (status === 'pending') {
      const tokenForRoleApproval = await createVerificationToken(newUser._id as string)
      try {
        await sendApprovalEmail(
          userToSend, 
          'register', 
          tokenForRoleApproval,
          superAdminEmails
        )
      } catch (emailErr) {
        console.error('Email send failed during admin approval notification:', emailErr)
      }
    }

 
    if (!newUser.isVerified) {
      const verificationToken = await createVerificationToken(newUser._id as string)
      try {
        await sendApprovalEmail(
          userToSend,
          'registerverificationcode',
          verificationToken
        )
      } catch (emailErr) {
        console.error('Email send failed during verification code email:', emailErr)
      }
    }

    const baseUser = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phoneNumber: Number(newUser.phoneNumber),
      role: newUser.role,
      status: newUser.status,
      isVerified: newUser.isVerified,
    }

 
    if (finalRole === 'user') {
      const token = await signAppToken({
        id: userToSend._id,
        phoneNumber: userToSend.phoneNumber,
        name: userToSend.name,
        role: userToSend.role,
      })

      console.log(token)

      return NextResponse.json(
        {
          message: 'Registration successful',
          user: baseUser,
        },
        { status: 201 }
      )
    }

 
    return NextResponse.json(
      {
        message: 'Registration successful; pending approval',
        user: baseUser,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Server error.' },
      { status: 500 }
    )
  }
}