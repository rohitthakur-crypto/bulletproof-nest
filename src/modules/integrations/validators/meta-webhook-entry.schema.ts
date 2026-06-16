import z from 'zod';

import { metaMessagingEventSchema } from './meta-message-event.schema';
import { metaWebhookChangeSchema } from './meta-webhook-change.schema';

export const metaWebhookEntrySchema = z
  .object({
    id: z.string(),

    time: z.number().optional(),

    messaging: z.array(metaMessagingEventSchema).default([]),

    changes: z.array(metaWebhookChangeSchema).default([]),
  })
  .passthrough();

export type MetaWebhookEntry = z.infer<typeof metaWebhookEntrySchema>;
