import type { IncomingMessage } from 'node:http';
import type { ServerResponse } from 'node:http';
import { performance } from 'node:perf_hooks';

import { Injectable, NestMiddleware } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { resolveIncomingMessage, resolveRequestId, resolveServerResponse } from '@/common/utils';
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

  use(
    req: FastifyRequest | IncomingMessage,
    res: FastifyReply | ServerResponse,
    next: () => void,
  ): void {
    if (!this.config.logger.autoLogging) {
      next();
      return;
    }

    const startedAt = performance.now();
    const serverResponse = resolveServerResponse(res);
    const incoming = resolveIncomingMessage(req);

    let logged = false;

    const writeAccessLog = (hasError = false) => {
      if (logged) {
        return;
      }

      logged = true;

      const url = incoming.url ?? '/';

      if (shouldExcludeHttpLog(url)) {
        return;
      }

      const log = 'log' in req ? req.log : undefined;

      if (!log) {
        return;
      }

      const durationMs = Math.round(performance.now() - startedAt);
      const payload = buildHttpAccessLog({
        req,
        incoming,
        res: serverResponse,
        durationMs,
        requestId: resolveRequestId(req),
      });
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

    serverResponse.on('finish', () => writeAccessLog(false));
    serverResponse.on('close', () => {
      if (!serverResponse.writableFinished) {
        writeAccessLog(true);
      }
    });

    next();
  }
}
