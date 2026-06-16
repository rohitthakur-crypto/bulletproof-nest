import { Injectable, Optional } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { LogLevel } from './enums';
import type { IAppLogger } from './logger.interface';
import type { LogBindings, LogErrorPayload, LogMetadata } from './logger.types';
import { toErrorPayload } from './utils';

const LOG_CONTEXT_FIELD = 'context';

@Injectable()
export class AppLoggerService implements IAppLogger {
  private context?: string;
  private readonly bindings: LogBindings;

  constructor(
    @InjectPinoLogger(AppLoggerService.name)
    private readonly pino: PinoLogger,
    @Optional() context?: string,
    @Optional() bindings?: LogBindings,
  ) {
    this.context = context;
    this.bindings = { ...(bindings ?? {}) };
  }

  setContext(context: string): void {
    this.context = context;
  }

  trace(message: string, meta?: LogMetadata): void {
    this.log(LogLevel.TRACE, message, meta);
  }

  debug(message: string, meta?: LogMetadata): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  info(message: string, meta?: LogMetadata): void {
    this.log(LogLevel.INFO, message, meta);
  }

  warn(message: string, meta?: LogMetadata): void {
    this.log(LogLevel.WARN, message, meta);
  }

  error(message: string, meta?: LogMetadata, error?: Error | LogErrorPayload): void {
    const payload = error ? { ...meta, err: toErrorPayload(error) } : meta;
    this.log(LogLevel.ERROR, message, payload);
  }

  fatal(message: string, meta?: LogMetadata, error?: Error | LogErrorPayload): void {
    const payload = error ? { ...meta, err: toErrorPayload(error) } : meta;
    this.log(LogLevel.FATAL, message, payload);
  }

  child(bindings: LogBindings): IAppLogger {
    const nextContext = bindings.context !== undefined ? String(bindings.context) : this.context;

    return new AppLoggerService(this.pino, nextContext, {
      ...this.bindings,
      ...bindings,
    });
  }

  private log(level: LogLevel, message: string, meta?: LogMetadata): void {
    const payload = this.buildPayload(meta);

    if (payload) {
      this.pino[level](payload, message);
      return;
    }

    this.pino[level](message);
  }

  private buildPayload(meta?: LogMetadata): LogMetadata | undefined {
    const { context: bindingContext, ...restBindings } = this.bindings;
    const resolvedContext = this.context ?? bindingContext;

    const payload: LogMetadata = {
      ...restBindings,
      ...meta,
    };

    if (resolvedContext !== undefined) {
      payload[LOG_CONTEXT_FIELD] = String(resolvedContext);
    }

    return Object.keys(payload).length > 0 ? payload : undefined;
  }
}
