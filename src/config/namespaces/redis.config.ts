import { registerAs } from '@nestjs/config';

import { env } from '../validation/validate-env';

export const redisConfig = registerAs('redis', () => {
  const e = env();

  return {
    host: e.REDIS_HOST,

    port: e.REDIS_PORT,

    password: e.REDIS_PASSWORD,

    tls: e.REDIS_TLS ?? false,
  } as const;
});

export type RedisConfig = ReturnType<typeof redisConfig>;
