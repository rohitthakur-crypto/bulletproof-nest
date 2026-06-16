import { registerAs } from '@nestjs/config';

import type { DatabaseConfig } from '../interfaces';
import { getValidatedEnv } from '../validation/validate-env';

export const databaseConfig = registerAs('database', (): DatabaseConfig => {
  const e = getValidatedEnv();

  return {
    url: e.DATABASE_URL,
  };
});
