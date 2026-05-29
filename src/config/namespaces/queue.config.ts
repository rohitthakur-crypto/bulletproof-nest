import { registerAs } from '@nestjs/config';

import { env } from '../validation/validate-env';

export const queueConfig = registerAs('queue', () => {
  const e = env();

  return {
    prefix: e.QUEUE_PREFIX,

    redis: {
      host: e.REDIS_HOST,

      port: e.REDIS_PORT,

      password: e.REDIS_PASSWORD,

      tls: e.REDIS_TLS ?? false,
    },
  } as const;
});

export type QueueConfig = ReturnType<typeof queueConfig>;
