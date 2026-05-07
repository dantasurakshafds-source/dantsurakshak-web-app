 
import mongoose from 'mongoose';

const LesionVerificationTokenSchema = new mongoose.Schema({
  lesionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LesionRecord',
    required: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400,  
  },
});

export default mongoose.models.LesionVerificationToken ||
  mongoose.model(
    'LesionVerificationToken',
    LesionVerificationTokenSchema
  );
