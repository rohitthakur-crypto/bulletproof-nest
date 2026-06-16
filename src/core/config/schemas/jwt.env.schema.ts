import { z } from 'zod';

export const jwtEnvSchema = z.object({
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

  META_OAUTH_STATE_TOKEN_EXPIRES_IN: z.string().min(1).default('15m'),
  META_OAUTH_STATE_PRIVATE_KEY: z.string().default(''),
  META_OAUTH_STATE_PUBLIC_KEY: z.string().default(''),
});
