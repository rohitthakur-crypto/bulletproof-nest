import z from 'zod';

export const metaWebhookChangeSchema = z
  .object({
    field: z.string(),
    value: z.unknown(),
  })
  .passthrough();

export type MetaWebhookChange = z.infer<typeof metaWebhookChangeSchema>;
