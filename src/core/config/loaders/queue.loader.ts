import { registerAs } from '@nestjs/config';

import type { QueueConfig } from '../interfaces';
import { getValidatedEnv } from '../validation/validate-env';

export const queueConfig = registerAs('queue', (): QueueConfig => {
  const e = getValidatedEnv();

  return {
    prefix: e.QUEUE_PREFIX,
    redis: {
      host: e.REDIS_HOST,
      port: e.REDIS_PORT,
      password: e.REDIS_PASSWORD,
      tls: e.REDIS_TLS ?? false,
    },
  };
});
