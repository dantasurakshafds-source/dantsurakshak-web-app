 
import mongoose, { Schema, Document } from 'mongoose';

export interface ITermsRepeater {
  term_heading: { en: string; kn: string };
  term_description: { en: string; kn: string };
}

export interface ITermsAndConditions extends Document {
  terms_repeater: ITermsRepeater[];
  createdAt: Date;
  updatedAt: Date;
}

const Lang = {
  en: { type: String, required: true },
  kn: { type: String, required: true }
};

const TermsRepeaterSchema = new Schema<ITermsRepeater>(
  {
    term_heading: { ...Lang },
    term_description: { ...Lang }
  },
  { _id: false }
);

const TermsAndConditionsSchema = new Schema<ITermsAndConditions>(
  {
    terms_repeater: [TermsRepeaterSchema]
  },
  { timestamps: true }
);

export default mongoose.models.TermsAndConditions ||
  mongoose.model<ITermsAndConditions>('TermsAndConditions', TermsAndConditionsSchema);
