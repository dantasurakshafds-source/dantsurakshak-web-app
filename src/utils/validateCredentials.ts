import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { dbConnect } from '@/database/database';

export async function validateCredentials(
  phoneOrEmail: string,
  password?: string
) {
  try {
 
    await dbConnect();
    const input = phoneOrEmail.trim();
    let filter: any;

    if (input.includes('@')) {
      filter = { email: input.toLowerCase() };
    } else {
      const rawDigits = input.replace(/\D/g, '');
      const last10Digits = rawDigits.slice(-10);
      filter = {
        $or: [
          { phoneNumber: input },
          { phoneNumber: last10Digits },
          { phoneNumber: `+91${last10Digits}` },
          { phoneNumber: `91${last10Digits}` },
          { phoneNumber: rawDigits },
          { phoneNumber: Number(last10Digits) },
          { phoneNumber: Number(`91${last10Digits}`) },
        ],
      };
    }

    const user = await User.findOne(filter).select('+password').lean();

    if (!user) {
      return null;
    }
    if (password) {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return null;
      }
    }
    return user;
  } catch (error) {
    console.error('validateCredentials error:', error);
    return null;
  }
}