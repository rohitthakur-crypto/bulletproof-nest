import { z } from 'zod';

import { parseCommaSeparated } from './env-parsers';

import { Environment } from '@/common/enums';
import { LogLevel } from '@/core/logger/enums';

const envBool = (def = false) =>
  z
    .string()
    .optional()
    .default(def ? 'true' : 'false')
    .transform((v) => v === 'true' || v === '1');

export const envSchema = z.object({
  NODE_ENV: z.enum(Environment),

  LOG_LEVEL: z.enum(LogLevel).optional(),

  LOG_PRETTY: z.coerce.boolean().optional(),

  LOG_HTTP_AUTO: z.coerce.boolean().optional(),

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

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  USER_ACCESS_TOKEN_EXPIRES_IN: z.string().min(1).default('15m'),
  USER_ACCESS_PRIVATE_KEY: z.string().default(''),
  USER_ACCESS_PUBLIC_KEY: z.string().default(''),

  USER_REFRESH_TOKEN_EXPIRES_IN: z.string().min(1).default('30d'),
  USER_REFRESH_PRIVATE_KEY: z.string().default(''),
  USER_REFRESH_PUBLIC_KEY: z.string().default(''),

  USER_PASSWORD_RESET_TOKEN_EXPIRES_IN: z.string().min(1).default('15m'),
  USER_PASSWORD_RESET_PRIVATE_KEY: z.string().default(''),
  USER_PASSWORD_RESET_PUBLIC_KEY: z.string().default(''),

  USER_EMAIL_VERIFICATION_TOKEN_EXPIRES_IN: z.string().min(1).default('24h'),
  USER_EMAIL_VERIFICATION_PRIVATE_KEY: z.string().default(''),
  USER_EMAIL_VERIFICATION_PUBLIC_KEY: z.string().default(''),

  ADMIN_ACCESS_TOKEN_EXPIRES_IN: z.string().min(1).default('15m'),
  ADMIN_ACCESS_PRIVATE_KEY: z.string().default(''),
  ADMIN_ACCESS_PUBLIC_KEY: z.string().default(''),

  ADMIN_REFRESH_TOKEN_EXPIRES_IN: z.string().min(1).default('30d'),
  ADMIN_REFRESH_PRIVATE_KEY: z.string().default(''),
  ADMIN_REFRESH_PUBLIC_KEY: z.string().default(''),

  ADMIN_PASSWORD_RESET_TOKEN_EXPIRES_IN: z.string().min(1).default('15m'),
  ADMIN_PASSWORD_RESET_PRIVATE_KEY: z.string().default(''),
  ADMIN_PASSWORD_RESET_PUBLIC_KEY: z.string().default(''),

  REDIS_HOST: z.string().min(1).default('localhost'),

  REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),

  REDIS_PASSWORD: z.string().min(1, 'REDIS_PASSWORD is required'),

  REDIS_TLS: envBool(false),

  QUEUE_PREFIX: z.string().min(1).default('manychat-clone'),

  FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required'),

  FIREBASE_CLIENT_EMAIL: z.string().email('FIREBASE_CLIENT_EMAIL must be a valid email'),

  FIREBASE_PRIVATE_KEY: z.string().min(1, 'FIREBASE_PRIVATE_KEY is required'),
});
