import { z } from 'zod';

import { parseCommaSeparated } from '../utils/parse-comma-separated.util';

import { Environment } from '@/common/enums';

export const appEnvSchema = z.object({
  NODE_ENV: z.enum(Environment),

  REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(300_000).default(30_000),

  HOST: z.string().min(1).default('0.0.0.0'),

  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  APP_NAME: z.string().min(1).default('manychat-clone'),

  API_PREFIX: z.string().min(1).default('api'),

  API_VERSION: z.string().min(1).default('v1'),

  CORS_ORIGINS: z
    .string()
    .min(1, 'CORS_ORIGINS is required')
    .transform(parseCommaSeparated)
    .pipe(
      z
        .array(z.string().url({ message: 'Each CORS_ORIGIN must be a valid URL' }))
        .min(1, 'CORS_ORIGINS must include at least one origin'),
    ),
});
