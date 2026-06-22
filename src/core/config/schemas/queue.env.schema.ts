import { z } from 'zod';

export const queueEnvSchema = z.object({
  QUEUE_PREFIX: z.string().min(1).default('manychat-clone'),
  QUEUE_REDIS_DB: z.coerce.number().int().min(0).max(15).default(1),
  QUEUE_DEFAULT_JOB_OPTIONS_ATTEMPTS: z.coerce.number().int().min(1).default(3),
  QUEUE_DEFAULT_JOB_OPTIONS_BACKOFF_TYPE: z.enum(['exponential', 'linear', 'fixed']),
  QUEUE_DEFAULT_JOB_OPTIONS_BACKOFF_DELAY: z.coerce.number().int().min(1000),
  QUEUE_DEFAULT_JOB_OPTIONS_REMOVE_ON_COMPLETE: z.coerce.number().int().min(1000),
  QUEUE_DEFAULT_JOB_OPTIONS_REMOVE_ON_FAIL: z.coerce.number().int().min(1000),
});
