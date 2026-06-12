import { registerAs } from '@nestjs/config';

import type { LoggerConfig } from '../interfaces';
import { getValidatedEnv } from '../validation/validate-env';

import { Environment } from '@/common/enums';
import { LogLevel } from '@/core/logger/enums';

const DEV_ENVIRONMENTS = new Set<Environment>([Environment.DEVELOPMENT, Environment.LOCAL]);

export const loggerConfig = registerAs('logger', (): LoggerConfig => {
  const e = getValidatedEnv();
  const isDev = DEV_ENVIRONMENTS.has(e.NODE_ENV);

  return {
    level: e.LOG_LEVEL ?? (isDev ? LogLevel.Debug : LogLevel.Info),
    pretty: e.LOG_PRETTY ?? isDev,
    autoLogging: e.LOG_HTTP_AUTO ?? true,
  };
});
