import {z} from 'zod';
import {
  validateEmail,
  validatePassword,
  validateMobileNumber,
} from '../common-rules';
import i18n from '../../../../i18n.config';

export const SignupSchema = z.object({
  Name: z.string().min(1, {message: i18n.t('Validation.nameIsRequired')}),
  lastName: z.string().min(1, {message: i18n.t('Validation.lastNameRequired')}),

  gender: z
    .object({
      key: z.string(),
      value: z.string(),
    })
    .refine(data => data.key && data.value, {
      message: i18n.t('Validation.genderRequired'),
    }),
  password: validatePassword,
  mobile: validateMobileNumber,
  email: z
    .string()
    .optional()
    .refine(email => !email || validateEmail.safeParse(email).success, {
      message: i18n.t('Validation.invalidEmail'),
    }),
});

// generate form types from zod validation schema
export type SignupSchemaType = z.infer<typeof SignupSchema>;
