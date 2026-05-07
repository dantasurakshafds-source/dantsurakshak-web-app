import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
 
import User from '@/models/User';
import { dbConnect } from '@/database/database';

async function seedSuperAdmin() {
    try {
        await dbConnect();
        
        const email = 'superadmin@gmail.com';
        const password = 'superadmin@1234';
        const name = 'super admin';
        
        const existing = await User.findOne({ email, role: 'super-admin' });
        
        if (existing) {
            console.log('Super admin already exists with this email');
            await mongoose.disconnect();
            return;
        }
        
        const hashed = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashed,
            role: 'super-admin',
            status: 'approved',
            isVerified: true,
            phoneNumber: '',
        });
        
        await user.save();
        console.log('Super admin created successfully');
    } catch (error) {
        console.error('Error seeding super admin:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedSuperAdmin();