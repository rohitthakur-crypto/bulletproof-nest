import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import type { IAppLogger } from './logger.interface';
import { AppLoggerService } from './logger.service';
import type { LogBindings } from './logger.types';

/**
 * Creates context-scoped loggers without mutating the shared PinoLogger instance.
 */
@Injectable()
export class LoggerFactory {
  constructor(
    @InjectPinoLogger(LoggerFactory.name)
    private readonly rootLogger: PinoLogger,
  ) {}

  create(context: string, bindings?: LogBindings): IAppLogger {
    return new AppLoggerService(this.rootLogger, context, bindings);
  }
}
