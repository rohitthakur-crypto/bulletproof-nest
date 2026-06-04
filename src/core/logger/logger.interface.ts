import type { LogBindings, LogErrorPayload, LogMetadata } from './logger.types';

export interface IAppLogger {
  setContext(context: string): void;

  trace(message: string, meta?: LogMetadata): void;

  debug(message: string, meta?: LogMetadata): void;

  info(message: string, meta?: LogMetadata): void;

  warn(message: string, meta?: LogMetadata): void;

  error(message: string, meta?: LogMetadata, error?: Error | LogErrorPayload): void;

  fatal(message: string, meta?: LogMetadata, error?: Error | LogErrorPayload): void;

  child(bindings: LogBindings): IAppLogger;
}
