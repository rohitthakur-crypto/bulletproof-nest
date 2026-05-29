import { envSchema } from './env.schema';

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    console.error('Invalid environment variables', result.error.format());

    throw new Error('Environment validation failed');
  }

  return result.data;
}

export function env(): ReturnType<typeof validateEnv> {
  return validateEnv(process.env);
}
