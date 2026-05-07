import mongoose, { Schema, Document, Model, models } from 'mongoose';

export interface IOtpToken extends Document {
    email: string;
    otp: string;
    expiresAt: Date;
}

const otpTokenSchema = new Schema<IOtpToken>(
    {
        email: { type: String, required: true, index: true },
        otp: { type: String, required: true },
        expiresAt: { type: Date, required: true, index: true },
    },
    { timestamps: true }
);


otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpToken: Model<IOtpToken> =
    models.forgotpasswordtokens ||
    mongoose.model<IOtpToken>('forgotpasswordtokens', otpTokenSchema);

export default OtpToken;
