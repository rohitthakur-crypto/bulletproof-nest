import type { LogLevel } from '@/core/logger/enums';

export interface LoggerConfig {
  readonly level: LogLevel;
  readonly pretty: boolean;
  readonly autoLogging: boolean;
}
