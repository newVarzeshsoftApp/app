import {z} from 'zod';
import i18n from '../../../i18n.config';

export const AmountSchema = z.object({
  amount: z.string().min(1, {message: i18n.t('Validation.AmountIsRequired')}),
});

// Generate form types from zod validation schema
export type AmountSchemaType = z.infer<typeof AmountSchema>;
