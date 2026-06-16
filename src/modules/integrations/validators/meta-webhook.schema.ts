import { createZodDto } from 'nestjs-zod';
import z from 'zod';

import { MetaWebhookObject } from '../enums';

import { metaWebhookEntrySchema } from './meta-webhook-entry.schema';

export const metaWebhookEventBodySchema = z
  .object({
    object: z.enum(MetaWebhookObject),

    entry: z.array(metaWebhookEntrySchema).min(1, 'At least one entry is required'),
  })
  .strict();

export type MetaWebhookEventBody = z.infer<typeof metaWebhookEventBodySchema>;

export class MetaWebhookEventBodyDto extends createZodDto(metaWebhookEventBodySchema) {}
