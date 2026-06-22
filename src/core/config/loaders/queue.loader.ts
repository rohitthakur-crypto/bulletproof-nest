import { registerAs } from '@nestjs/config';

import type { QueueConfig } from '../interfaces';
import { getValidatedEnv } from '../validation/validate-env';

export const queueConfig = registerAs('queue', (): QueueConfig => {
  const e = getValidatedEnv();

  return {
    prefix: e.QUEUE_PREFIX,
    db: e.QUEUE_REDIS_DB || 0,

    defaultJobOptions: {
      attempts: e.QUEUE_DEFAULT_JOB_OPTIONS_ATTEMPTS,
      backoff: {
        type: e.QUEUE_DEFAULT_JOB_OPTIONS_BACKOFF_TYPE,
        delay: e.QUEUE_DEFAULT_JOB_OPTIONS_BACKOFF_DELAY,
      },
      removeOnComplete: e.QUEUE_DEFAULT_JOB_OPTIONS_REMOVE_ON_COMPLETE,
      removeOnFail: e.QUEUE_DEFAULT_JOB_OPTIONS_REMOVE_ON_FAIL,
    },

    redis: {
      host: e.REDIS_HOST,
      port: e.REDIS_PORT,
      password: e.REDIS_PASSWORD,
      tls: e.REDIS_TLS ?? false,
    },
  };
});
