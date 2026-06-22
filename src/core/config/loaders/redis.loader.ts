import { registerAs } from '@nestjs/config';

import type { RedisConfig } from '../interfaces';
import { getValidatedEnv } from '../validation/validate-env';

export const redisConfig = registerAs('redis', (): RedisConfig => {
  const e = getValidatedEnv();

  return {
    host: e.REDIS_HOST,
    port: e.REDIS_PORT,
    password: e.REDIS_PASSWORD,
    tls: e.REDIS_TLS ?? false,
    db: e.REDIS_DB || 0,
  };
});
