import mongoose, { Schema, Document, Model, models } from 'mongoose';

export interface IAccountDeletionRequest extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phoneNumber: string;
  reason?: string;
  status: 'pending' | 'completed' | 'rejected';
  lesionCount: number;
  questionnaireCount: number;
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const accountDeletionRequestSchema = new Schema<IAccountDeletionRequest>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    reason: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'rejected'],
      default: 'pending',
    },
    lesionCount: { type: Number, default: 0 },
    questionnaireCount: { type: Number, default: 0 },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      default: null,
    },
    rejectionReason: { type: String, default: '' },
  },
  { timestamps: true }
);

const AccountDeletionRequest: Model<IAccountDeletionRequest> =
  models.AccountDeletionRequest ||
  mongoose.model<IAccountDeletionRequest>(
    'AccountDeletionRequest',
    accountDeletionRequestSchema
  );

export default AccountDeletionRequest;
