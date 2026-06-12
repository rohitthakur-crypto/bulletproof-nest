import { z } from 'zod';

export const queueEnvSchema = z.object({
  QUEUE_PREFIX: z.string().min(1).default('manychat-clone'),
});
