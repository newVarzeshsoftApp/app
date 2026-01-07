import {z} from 'zod';
import {validateUsername} from '../common-rules';

export const ForgetPasswordSchema = z.object({
  username: validateUsername,
});

// Generate form types from zod validation schema
export type ForgetPasswordSchemaType = z.infer<typeof ForgetPasswordSchema>;
