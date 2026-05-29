import { registerAs } from '@nestjs/config';

import { env } from '../validation/validate-env';

export const databaseConfig = registerAs('database', () => {
  const e = env();

  return {
    url: e.DATABASE_URL,
  } as const;
});

export type DatabaseConfig = ReturnType<typeof databaseConfig>;
