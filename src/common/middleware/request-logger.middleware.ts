import { performance } from 'node:perf_hooks';

import { Injectable, NestMiddleware } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { AppConfigService } from '@/config';
import {
  LogLevel,
  buildHttpAccessLog,
  formatHttpAccessMessage,
  resolveHttpLogLevel,
  shouldExcludeHttpLog,
} from '@/core/logger';

/**
 * Emits one structured access log per HTTP request when the response finishes.
 *
 * Uses the pino child logger attached by nestjs-pino (`req.log`) so redaction,
 * log level, and JSON/pretty formatting stay centralized in pino configuration.
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly config: AppConfigService) {}

  use(req: FastifyRequest, res: FastifyReply, next: () => void): void {
    if (!this.config.logger.autoLogging) {
      next();
      return;
    }

    const startedAt = performance.now();

    let logged = false;

    const writeAccessLog = (hasError = false) => {
      if (logged) {
        return;
      }

      logged = true;

      if (shouldExcludeHttpLog(req.url)) {
        return;
      }

      const log = req.log;

      if (!log) {
        return;
      }

      const durationMs = Math.round(performance.now() - startedAt);
      const payload = buildHttpAccessLog({ req, res: res.raw, durationMs });
      const level = resolveHttpLogLevel(payload.statusCode, hasError);
      const message = formatHttpAccessMessage(payload);

      switch (level) {
        case LogLevel.Error:
          log.error(payload, message);
          break;

        case LogLevel.Warn:
          log.warn(payload, message);
          break;

        default:
          log.info(payload, message);
          break;
      }
    };

    res.raw.on('finish', () => writeAccessLog(false));
    res.raw.on('close', () => {
      if (!res.raw.writableFinished) {
        writeAccessLog(true);
      }
    });

    next();
  }
}
