

import { QuestionnaireTypes } from '@/utils/Types';
import mongoose, { Model } from 'mongoose';
import { Counter } from './Counter';


const QuestionnaireSchema = new mongoose.Schema({
  images: {
    type: [String],
    default: [],
    validate: {
      validator: (arr: string[]) => arr.length <= 5,
      message: 'You can upload at most 5 images'
    }
  },
  demographics: { type: String },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  idCardAvailable: { type: String, required: true },
  cardNumber: { type: String, required: true },
  religion: { type: String, required: true },
  religion_input: { type: String },
  education: { type: String, required: true },
  occupation: { type: String, required: true },
  income: { type: Number, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  familyHistory: { type: String },
  firstDegreeRelativeOralCancer: { type: String, required: true },
  height: { type: Number, required: true },
  diabetes: { type: String, required: true },
  hypertension: { type: String, required: true },
  dietHistory: { type: String, required: true },
  fruitsConsumption: { type: String, required: true },
  vegetableConsumption: { type: String, required: true },
  habitHistory: { type: String },
  tobaccoChewer: { type: String },
  tobaccoType: { type: String },
  discontinuedHabit: { type: String, required: true },
  durationOfDiscontinuingHabit: { type: String, required: true },
  otherConsumptionHistory: { type: String },
  alcoholConsumption: { type: String, required: true },
  smoking: { type: String, required: true },
  oralCavityExamination: { type: String },
  presenceOfLesion: { type: String, required: true },
  reductionInMouthOpening: { type: String, required: true },
  suddenWeightLoss: { type: String, required: true },
  presenceOfSharpTeeth: { type: String, required: true },
  presenceOfDecayedTeeth: { type: String, required: true },
  presenceOfGumDisease: { type: [String], required: true },
  presenceOfFluorosis: { type: String, required: true },
  send_to: { type: [mongoose.Schema.Types.ObjectId], ref: 'users', required: true },
  submitted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },

  status: { type: String, default: 'unsubmit' },
  adminAction: { type: Boolean, default: false },
  assignTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    default: null,
  },


  questionary_type: { type: String, select: false },
  diagnosis_notes: { type: String, select: false },
  recomanded_actions: { type: String, select: false },
  comments_or_notes: { type: String, select: false },
  send_email_to_dantasurakshaks: { type: Boolean, select: false, default: false },
  case_number: { type: String, unique: true }
}, { timestamps: true });



QuestionnaireSchema.pre('save', async function (next) {
  if (!this.isNew) return next();


  const counter = await Counter.findByIdAndUpdate(
    'questionnaire',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  this.case_number = `Q${counter.seq}`;
  next();
});


const Questionnaire: Model<QuestionnaireTypes> =
  (mongoose.models.Questionnaire as Model<QuestionnaireTypes>) ||
  mongoose.model<QuestionnaireTypes>('Questionnaire', QuestionnaireSchema);

export default Questionnaire;
