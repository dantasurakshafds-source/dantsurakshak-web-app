
import Joi from 'joi';

export const questionnaireSchema = Joi.object({
  demographics: Joi.any(),
  name: Joi.any().required(),
  age: Joi.any().required(),
  gender: Joi.any().required(),
  bloodGroup: Joi.any().required(),
  idCardAvailable: Joi.any().required(),
  cardNumber: Joi.any().required(),
  religion: Joi.any().required(),
  religion_input: Joi.any(),
  education: Joi.any().required(),
  occupation: Joi.any().required(),
  income: Joi.any().required(),
  phoneNumber: Joi.any().required(),
  address: Joi.any().required(),
  familyHistory: Joi.any(),
  firstDegreeRelativeOralCancer: Joi.any().required(),
  height: Joi.any().required(),
  diabetes: Joi.any().required(),
  hypertension: Joi.any().required(),
  dietHistory: Joi.any().required(),
  fruitsConsumption: Joi.any().required(),
  vegetableConsumption: Joi.any().required(),
  habitHistory: Joi.any(),
  tobaccoChewer: Joi.any(),
  tobaccoType: Joi.any(),
  discontinuedHabit: Joi.any().required(),
  durationOfDiscontinuingHabit: Joi.any().required(),
  otherConsumptionHistory: Joi.any(),
  alcoholConsumption: Joi.any().required(),
  smoking: Joi.any().required(),
  oralCavityExamination: Joi.any(),
  presenceOfLesion: Joi.any().required(),
  reductionInMouthOpening: Joi.any().required(),
  suddenWeightLoss: Joi.any().required(),
  presenceOfSharpTeeth: Joi.any().required(),
  presenceOfDecayedTeeth: Joi.any().required(),
  presenceOfGumDisease: Joi.any().required(),
  presenceOfFluorosis: Joi.any().required()
}).unknown(true);




export const userSchemaErrors = Joi.object({
  phoneNumber: Joi.any(),
  role: Joi.any(),
  name: Joi.any().required(),
  email: Joi.any().required(),
  password: Joi.any().required(),
}).unknown(true);
