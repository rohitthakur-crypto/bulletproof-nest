import z from 'zod';

import { MetaChangeField } from '../enums';

export const metaWebhookChangeSchema = z
  .object({
    field: z.string() as z.ZodType<MetaChangeField>,
    value: z.unknown(),
  })
  .passthrough();

export type MetaWebhookChange = z.infer<typeof metaWebhookChangeSchema>;
