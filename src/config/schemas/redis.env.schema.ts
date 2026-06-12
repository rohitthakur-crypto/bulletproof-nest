import { z } from 'zod';

import { envBool } from './helpers/env-bool.schema';

export const redisEnvSchema = z.object({
  REDIS_HOST: z.string().min(1).default('localhost'),

  REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),

  REDIS_PASSWORD: z.string().min(1, 'REDIS_PASSWORD is required'),

  REDIS_TLS: envBool(false),
});
