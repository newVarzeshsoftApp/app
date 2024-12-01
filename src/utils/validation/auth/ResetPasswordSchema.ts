import {z} from 'zod';
import {validateConfirmPassword, validatePassword} from '../common-rules';

export const ResetPasswordSchema = z.object({
  newPassword: validatePassword,
  ConfirmNewPassword: validateConfirmPassword,
});

// generate form types from zod validation schema
export type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>;
