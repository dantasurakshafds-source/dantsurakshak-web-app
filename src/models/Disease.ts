import mongoose, { Schema, Document } from 'mongoose';

// Multi-language sub-schema (no object id)
const MultiLangSchema = new Schema({
  en: { type: String },
  kn: { type: String }
}, { _id: false });

// Repeater schemas: only description
const CauseRepeaterSchema = new Schema({
  description: { type: MultiLangSchema }
}, { _id: false });

const SymptomsRepeaterSchema = new Schema({
  description: { type: MultiLangSchema }
}, { _id: false });

const PreventionTipsRepeaterSchema = new Schema({
  description: { type: MultiLangSchema }
}, { _id: false });

const TreatmentOptionRepeaterSchema = new Schema({
  description: { type: MultiLangSchema }
}, { _id: false });

// Main section schemas: title once, repeater for descriptions
const CauseSchema = new Schema({
  cause_title: { type: MultiLangSchema },
  cause_repeater: { type: [CauseRepeaterSchema] }
}, { _id: true });

const SymptomsSchema = new Schema({
  symptoms_title: { type: MultiLangSchema },
  symptoms_repeater: { type: [SymptomsRepeaterSchema] }
}, { _id: true });

const PreventionTipsSchema = new Schema({
  prevention_tips_title: { type: MultiLangSchema },
  prevention_tips_repeater: { type: [PreventionTipsRepeaterSchema] }
}, { _id: true });

const TreatmentOptionSchema = new Schema({
  treatment_option_title: { type: MultiLangSchema },
  treatment_option_repeater: { type: [TreatmentOptionRepeaterSchema] }
}, { _id: true });

// Interface definition
export interface IDisease extends Document {
  disease_main_title?: { en?: string; kn?: string };
  disease_main_image?: string;
  disease_slug?: { en?: string; kn?: string };

  disease_title?: { en?: string; kn?: string };
  disease_description?: { en?: string; kn?: string };
  disease_icon?: string;

  common_cause_tab_title?: { en?: string; kn?: string };
  common_cause?: {
    cause_title?: { en?: string; kn?: string };
    cause_repeater?: {
      description?: { en?: string; kn?: string };
    }[];
  }[];

  symptoms_tab_title?: { en?: string; kn?: string };
  symptoms?: {
    symptoms_title?: { en?: string; kn?: string };
    symptoms_repeater?: {
      description?: { en?: string; kn?: string };
    }[];
  }[];

  prevention_tips_tab_title?: { en?: string; kn?: string };
  prevention_tips?: {
    prevention_tips_title?: { en?: string; kn?: string };
    prevention_tips_repeater?: {
      description?: { en?: string; kn?: string };
    }[];
  }[];

  treatment_option_tab_title?: { en?: string; kn?: string };
  treatment_option?: {
    treatment_option_title?: { en?: string; kn?: string };
    treatment_option_repeater?: {
      description?: { en?: string; kn?: string };
    }[];
  }[];

  category: mongoose.Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
 
const DiseaseSchema = new Schema<IDisease>({
  disease_main_title: { type: MultiLangSchema },
  disease_main_image: { type: String },
  disease_slug: { type: MultiLangSchema },

  disease_title: { type: MultiLangSchema },
  disease_description: { type: MultiLangSchema },
  disease_icon: { type: String },

  common_cause_tab_title: { type: MultiLangSchema },
  common_cause: { type: [CauseSchema] },

  symptoms_tab_title: { type: MultiLangSchema },
  symptoms: { type: [SymptomsSchema] },

  prevention_tips_tab_title: { type: MultiLangSchema },
  prevention_tips: { type: [PreventionTipsSchema] },

  treatment_option_tab_title: { type: MultiLangSchema },
  treatment_option: { type: [TreatmentOptionSchema] },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'categories',
    required: true
  }
}, { timestamps: true });

export default mongoose.models.diseases || mongoose.model<IDisease>('diseases', DiseaseSchema);