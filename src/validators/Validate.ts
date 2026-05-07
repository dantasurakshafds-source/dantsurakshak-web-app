 
import { QuestionnaireTypes, Users } from '@/utils/Types';
import { questionnaireSchema, userSchemaErrors } from './Schemas';

export function ValidateQuestionnaireFields(data: QuestionnaireTypes) {
  const { error, value } = questionnaireSchema.validate(data, {
    abortEarly: false,     
    allowUnknown: true     
  });
  if (error) throw error;
  return value;
}

export function validateUserFields(data: Users) {
  const { error, value } = userSchemaErrors.validate(data, { abortEarly: false });
  if (error instanceof Error) {
    throw error;
  }
  return value;
}
