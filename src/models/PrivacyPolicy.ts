import mongoose, { Schema, Document } from 'mongoose';

export interface IPrivacyPolicyRepeater {
    privacy_heading: { en: string; kn: string };
    privacy_description: { en: string; kn: string };
}

export interface IPrivacyPolicy extends Document {
    privacy_policy_repeater: IPrivacyPolicyRepeater[];
    createdAt: Date;
    updatedAt: Date;
}

const Lang = {
    en: { type: String, required: true },
    kn: { type: String, required: true }
};

const PrivacyPolicyRepeaterSchema = new Schema<IPrivacyPolicyRepeater>(
    {
        privacy_heading: { ...Lang },
        privacy_description: { ...Lang }
    },
    { _id: false }
);

const PrivacyPolicySchema = new Schema<IPrivacyPolicy>(
    {
        privacy_policy_repeater: [PrivacyPolicyRepeaterSchema]
    },
    { timestamps: true }
);

export default mongoose.models.PrivacyPolicy ||
    mongoose.model<IPrivacyPolicy>('PrivacyPolicy', PrivacyPolicySchema);
