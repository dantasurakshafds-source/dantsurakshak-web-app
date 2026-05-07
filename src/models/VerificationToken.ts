import mongoose from 'mongoose';

const VerificationTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 },  
});

export default mongoose.models.verificationtokens || mongoose.model('verificationtokens', VerificationTokenSchema);
