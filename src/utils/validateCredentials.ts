import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { dbConnect } from '@/database/database';

export async function validateCredentials(
  phoneOrEmail: string,
  password?: string
) {
  try {
 
    await dbConnect();
    const filter = phoneOrEmail.includes('@')
      ? { email: phoneOrEmail.toLowerCase().trim() }
      : { phoneNumber: phoneOrEmail.trim() };
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