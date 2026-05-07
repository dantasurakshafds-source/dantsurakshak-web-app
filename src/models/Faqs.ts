import mongoose, { Schema, Document } from "mongoose";
export interface IFaq extends Document {
  faqs_title: {
    en: string;
    kn: string;
  };
  faqs_repeater: Array<{
    faqs_repeat_question: {
      en: string;
      kn: string;
    };
    faqs_repeat_answer: {
      en: string;  
      kn: string;
    };
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const FaqSchema = new Schema<IFaq>(
  {
    faqs_title: {
      en: { type: String, required: true },
      kn: { type: String, required: true },
    },
    faqs_repeater: [
      {
        faqs_repeat_question: {
          en: { type: String, required: true },
          kn: { type: String, required: true },
        },
        faqs_repeat_answer: {
          en: { type: String, required: true },
          kn: { type: String, required: true },
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Faq || mongoose.model<IFaq>("Faq", FaqSchema);