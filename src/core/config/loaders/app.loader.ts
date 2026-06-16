import { registerAs } from '@nestjs/config';

import type { AppConfig } from '../interfaces';
import { getValidatedEnv } from '../validation/validate-env';

export const appConfig = registerAs('app', (): AppConfig => {
  const e = getValidatedEnv();

  return {
    env: e.NODE_ENV,
    name: e.APP_NAME,
    host: e.HOST,
    port: e.PORT,
    apiPrefix: e.API_PREFIX,
    apiVersion: e.API_VERSION,
    corsOrigins: e.CORS_ORIGINS,
    requestTimeoutMs: e.REQUEST_TIMEOUT_MS,
  };
});
