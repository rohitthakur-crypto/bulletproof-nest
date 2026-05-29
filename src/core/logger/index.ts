export { AppLoggerModule } from './logger.module';

export { AppLoggerService } from './logger.service';

export { LoggerFactory } from './logger.factory';

export { LoggingInterceptor } from './interceptors/logging.interceptor';

export type { IAppLogger } from './logger.interface';

export type { LogBindings, LogErrorPayload, LogMetadata } from './logger.types';

export { LogLevel } from './enums/log-level.enum';

export {
  CORRELATION_ID_HEADER,
  LOG_EXCLUDED_ROUTES,
  REQUEST_ID_HEADER,
  SENSITIVE_LOG_PATHS,
} from './logger.constants';

export {
  buildHttpAccessLog,
  formatHttpAccessMessage,
  resolveClientIp,
  resolveHttpLogLevel,
  resolveRequestUrl,
  shouldExcludeHttpLog,
} from './utils/http-access-log.util';

export type { HttpAccessLogPayload } from './utils/http-access-log.util';
