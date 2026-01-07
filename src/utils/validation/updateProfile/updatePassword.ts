import {z} from 'zod';
import {
  validateConfirmPassword,
  validateNewPassword,
  validatePassword,
} from '../common-rules';
import i18n from '../../../../i18n.config';

export const UpdatePasswordSchema = z
  .object({
    currentPassword: validatePassword,
    newPassword: validateNewPassword,
    confirmNewPassword: validateNewPassword,
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: i18n.t('Validation.passwordsDoNotMatch'),
    path: ['confirmNewPassword'],
  });

export type UpdatePasswordSchemaType = z.infer<typeof UpdatePasswordSchema>;
