 
import mongoose from 'mongoose';

const QuestionnaireVerificationTokenSchema = new mongoose.Schema({
  questionnaireId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Questionnaire',
    required: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 },
});

export default mongoose.models.QuestionnaireVerificationToken ||
  mongoose.model(
    'QuestionnaireVerificationToken',
    QuestionnaireVerificationTokenSchema
  );
