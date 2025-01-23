import {z} from 'zod';
import {
  validateEmail,
  validateMobileNumber,
  validateNationalCode,
  validatePhoneNumber,
} from '../common-rules';
import i18n from '../../../../i18n.config';

export const UpdateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, {message: i18n.t('Validation.firstNameRequired')}),
  lastName: z.string().min(1, {message: i18n.t('Validation.lastNameRequired')}),
  mobile: validateMobileNumber.optional(),
  phone: validatePhoneNumber.optional(),

  birthday: z.object({
    jalaliDate: z
      .string()
      .optional()
      .refine(date => !date || date.match(/^\d{4}\/\d{1,2}\/\d{1,2}$/), {
        message: i18n.t('Validation.invalidJalaliDate'),
      }),
    gregorianDate: z
      .string()
      .optional()
      .refine(date => !date || date.match(/^\d{4}-\d{2}-\d{2}$/), {
        message: i18n.t('Validation.invalidGregorianDate'),
      }),
  }),
  address: z.string().optional(),
  nationalCode: validateNationalCode.optional(),

  gender: z
    .object({
      key: z.string(),
      value: z.string(),
    })
    .refine(data => data.key && data.value, {
      message: i18n.t('Validation.genderRequired'),
    })
    .optional(),

  email: z
    .string()
    .optional()
    .refine(email => !email || validateEmail.safeParse(email).success, {
      message: i18n.t('Validation.invalidEmail'),
    }),
});

// generate form types from zod validation schema
export type UpdateProfileSchemaType = z.infer<typeof UpdateProfileSchema>;
