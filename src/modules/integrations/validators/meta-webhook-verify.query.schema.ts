import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const metaWebhookVerifyQuerySchema = z.object({
  'hub.mode': z.literal('subscribe'),
  'hub.verify_token': z.string().min(1),
  'hub.challenge': z.string().min(1),
});

export type MetaWebhookVerifyQuery = z.infer<typeof metaWebhookVerifyQuerySchema>;

export class MetaWebhookVerifyQueryDto extends createZodDto(metaWebhookVerifyQuerySchema) {}
