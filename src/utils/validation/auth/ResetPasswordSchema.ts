import {z} from 'zod';
import {validatePassword} from '../common-rules';

export const ResetPasswordSchema = z
  .object({
    newPassword: validatePassword,
    ConfirmNewPassword: z.string().min(1, 'تکرار رمز عبور الزامی است'),
  })
  .refine(data => data.newPassword === data.ConfirmNewPassword, {
    message: 'رمز عبور با تکرار آن یکسان نیست',
    path: ['ConfirmNewPassword'],
  });

// generate form types from zod validation schema
export type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>;
