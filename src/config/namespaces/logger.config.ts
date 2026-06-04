import { registerAs } from '@nestjs/config';

import { env } from '../validation/validate-env';

import { Environment } from '@/common/enums';
import { LogLevel } from '@/core/logger/enums';

const DEV_ENVIRONMENTS = new Set<Environment>([Environment.Development, Environment.Local]);

export const loggerConfig = registerAs('logger', () => {
  const e = env();
  const isDev = DEV_ENVIRONMENTS.has(e.NODE_ENV);

  return {
    level: e.LOG_LEVEL ?? (isDev ? LogLevel.Debug : LogLevel.Info),
    pretty: e.LOG_PRETTY ?? isDev,
    autoLogging: e.LOG_HTTP_AUTO ?? true,
  } as const;
});

export type LoggerConfig = ReturnType<typeof loggerConfig>;
