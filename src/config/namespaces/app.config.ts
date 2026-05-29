import { registerAs } from '@nestjs/config';

import { env } from '../validation/validate-env';

export const appConfig = registerAs('app', () => {
  const e = env();

  return {
    env: e.NODE_ENV,

    name: e.APP_NAME,

    host: e.HOST,

    port: e.PORT,

    apiPrefix: e.API_PREFIX,

    apiVersion: e.API_VERSION,

    corsOrigins: e.CORS_ORIGINS,

    requestTimeoutMs: e.REQUEST_TIMEOUT_MS,
  } as const;
});

export type AppConfig = ReturnType<typeof appConfig>;
