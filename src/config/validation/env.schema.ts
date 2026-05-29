import { z } from 'zod';

import { parseCommaSeparated } from './env-parsers';

import { Environment } from '@/common/enums';
import { LogLevel } from '@/core/logger/enums';

export const envSchema = z.object({
  NODE_ENV: z.enum(Environment),

  LOG_LEVEL: z.enum(LogLevel).optional(),

  LOG_PRETTY: z.coerce.boolean().optional(),

  LOG_HTTP_AUTO: z.coerce.boolean().optional(),

  REQUEST_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(1_000)
    .max(300_000)
    .default(30_000),

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
        .array(
          z.string().url({ message: 'Each CORS_ORIGIN must be a valid URL' }),
        )
        .min(1, 'CORS_ORIGINS must include at least one origin'),
    ),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_SECRET: z
    .string()
    .min(1, 'JWT_SECRET is required')
    .refine(
      (val) => process.env.NODE_ENV !== 'production' || val.length >= 32,
      { message: 'JWT_SECRET must be at least 32 characters in production' },
    ),

  JWT_EXPIRES_IN: z.string().min(1).default('15m'),

  REFRESH_SECRET: z
    .string()
    .min(1, 'REFRESH_SECRET is required')
    .refine(
      (val) => process.env.NODE_ENV !== 'production' || val.length >= 32,
      {
        message: 'REFRESH_SECRET must be at least 32 characters in production',
      },
    ),

  REFRESH_EXPIRES_IN: z.string().min(1).default('7d'),

  REDIS_HOST: z.string().min(1).default('localhost'),

  REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),

  REDIS_PASSWORD: z.string().min(1, 'REDIS_PASSWORD is required'),

  REDIS_TLS: z.coerce.boolean().default(false),

  QUEUE_PREFIX: z.string().min(1).default('manychat-clone'),

  FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required'),

  FIREBASE_CLIENT_EMAIL: z
    .string()
    .email('FIREBASE_CLIENT_EMAIL must be a valid email'),

  FIREBASE_PRIVATE_KEY: z.string().min(1, 'FIREBASE_PRIVATE_KEY is required'),
});
