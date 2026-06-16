import z from 'zod';

import type { Env } from '../schemas';
import { envSchema } from '../schemas';

let cached: Env | null = null;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    console.error('Invalid environment variables', z.treeifyError(result.error));
    throw new Error('Environment validation failed');
  }

  cached = result.data;
  return cached;
}

export function getValidatedEnv(): Env {
  if (!cached) cached = validateEnv(process.env);
  return cached;
}
