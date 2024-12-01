import {z} from 'zod';
import i18n from '../../../i18n.config';

export const fileSchema = z.object({
  name: z.string(),
  url: z.string(),
  size: z.number(),
});

export type FileSchema = z.infer<typeof fileSchema>;

export const validateEmail = z
  .string()
  .min(1, {message: i18n.t('Validation.emailIsRequired')})
  .email({message: i18n.t('Validation.invalidEmail')});

export const validatePhoneNumber = z
  .string()
  .min(1, {message: i18n.t('Validation.phoneNumberIsRequired')})
  .regex(/^\+?[0-9]\d{6,14}$/, {
    message: i18n.t('Validation.invalidPhoneNumber'),
  });

export const validateUsername = z.string().superRefine((value, context) => {
  if (typeof value !== 'string') {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: i18n.t('Validation.invalidInputType'),
    });
    return;
  }
  if (/^[a-zA-Z]/.test(value)) {
    if (!validateEmail.safeParse(value).success) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: i18n.t('Validation.invalidEmail'),
      });
    }
  } else if (/^\+?[0-9]/.test(value)) {
    if (!validatePhoneNumber.safeParse(value).success) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: i18n.t('Validation.invalidPhoneNumber'),
      });
    }
  } else {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: i18n.t('Validation.enterEmailOrPhoneNumber'),
    });
  }
});

export const validatePassword = z
  .string()
  .min(1, {message: i18n.t('Validation.passwordRequired')})
  .min(6, {message: i18n.t('Validation.passwordLengthMin')})
  .regex(new RegExp('.*[A-Z].*'), {
    message: i18n.t('Validation.passwordOneUppercase'),
  })
  .regex(new RegExp('.*[a-z].*'), {
    message: i18n.t('Validation.passwordOneLowercase'),
  })
  .regex(new RegExp('.*\\d.*'), {
    message: i18n.t('Validation.passwordOneNumeric'),
  });

export const validateNewPassword = z
  .string()
  .min(1, {message: i18n.t('Validation.passwordRequired')})
  .min(6, {message: i18n.t('Validation.passwordLengthMin')})
  .regex(new RegExp('.*[A-Z].*'), {
    message: i18n.t('Validation.passwordOneUppercase'),
  })
  .regex(new RegExp('.*[a-z].*'), {
    message: i18n.t('Validation.passwordOneLowercase'),
  })
  .regex(new RegExp('.*\\d.*'), {
    message: i18n.t('Validation.passwordOneNumeric'),
  });

export const validateConfirmPassword = z
  .string()
  .min(1, {message: i18n.t('Validation.confirmPasswordRequired')})
  .min(6, {message: i18n.t('Validation.passwordLengthMin')})
  .regex(new RegExp('.*[A-Z].*'), {
    message: i18n.t('Validation.passwordOneUppercase'),
  })
  .regex(new RegExp('.*[a-z].*'), {
    message: i18n.t('Validation.passwordOneLowercase'),
  })
  .regex(new RegExp('.*\\d.*'), {
    message: i18n.t('Validation.passwordOneNumeric'),
  });
