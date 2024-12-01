import {z} from 'zod';
import {validateUsername} from '../common-rules';
import i18n from '../../../../i18n.config';

export const LoginSchema = z.object({
  username: validateUsername,
  password: z.string().min(1, {message: i18n.t('Validation.passwordRequired')}),
});

// Generate form types from zod validation schema
export type LoginSchemaType = z.infer<typeof LoginSchema>;
