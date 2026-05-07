
import mongoose, { Schema, Document, Model, models } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: 'user' | 'admin' | 'dantasurakshaks' | 'super-admin';
  status: 'pending' | 'approved' | 'rejected';
  isVerified: boolean,
  isPhoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  fcmToken?: string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    role: {
      type: String,
      enum: ['user', 'admin', 'dantasurakshaks', 'super-admin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    fcmToken: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },

  },
  { timestamps: true }
);

const User: Model<IUser> = models.users || mongoose.model<IUser>('users', userSchema);
export default User;
