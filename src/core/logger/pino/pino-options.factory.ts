import { randomUUID } from 'node:crypto';
import { IncomingMessage, ServerResponse } from 'node:http';

import { RequestMethod } from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { Params } from 'nestjs-pino';

import {
  CORRELATION_ID_HEADER,
  LOG_EXCLUDED_ROUTES,
  REQUEST_ID_HEADER,
  SENSITIVE_LOG_PATHS,
} from '../logger.constants';
import { resolveClientIp } from '../utils/http-access-log.util';

import type { AppConfig } from '@/config/namespaces/app.config';
import type { LoggerConfig } from '@/config/namespaces/logger.config';

function resolveIncomingId(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return Array.isArray(value) ? value[0] : value;
}

function resolveRequestId(req: IncomingMessage): string {
  const incoming =
    resolveIncomingId(req.headers[CORRELATION_ID_HEADER]) ??
    resolveIncomingId(req.headers[REQUEST_ID_HEADER]);

  return incoming ?? randomUUID();
}

function attachRequestIdHeader(
  req: IncomingMessage,
  res: ServerResponse,
  requestId: string,
): void {
  if (!res.getHeader(CORRELATION_ID_HEADER)) {
    res.setHeader(CORRELATION_ID_HEADER, requestId);
  }

  if (!res.getHeader(REQUEST_ID_HEADER)) {
    res.setHeader(REQUEST_ID_HEADER, requestId);
  }
}

export function createPinoModuleParams(
  logger: LoggerConfig,
  app: AppConfig,
): Params {
  return {
    pinoHttp: {
      name: app.name,
      level: logger.level,
      // Access logs are emitted by RequestLoggerMiddleware via req.log.
      autoLogging: false,
      redact: {
        paths: [...SENSITIVE_LOG_PATHS],
        censor: '[REDACTED]',
      },

      genReqId: (req, res) => {
        const requestId = resolveRequestId(req);
        attachRequestIdHeader(req, res, requestId);
        return requestId;
      },

      customProps: (req: IncomingMessage) => ({
        correlationId: req.id,
        requestId: req.id,
        environment: app.env,
      }),

      customAttributeKeys: {
        req: 'request',
        res: 'response',
        err: 'error',
        responseTime: 'durationMs',
      },

      // Status-aware levels keep production noise low (2xx/info, 4xx/warn, 5xx/error).
      customLogLevel: (_req, res, error) => {
        if (error || res.statusCode >= 500) {
          return 'error';
        }

        if (res.statusCode >= 400) {
          return 'warn';
        }

        return 'info';
      },

      serializers: {
        req: (req: FastifyRequest) => ({
          id: String(req.id ?? 'unknown'),
          method: req.method,
          url: req.url,
          query: req.query,
          remoteAddress: req.ip,
          ip: resolveClientIp(req.raw),
          userAgent: req.headers['user-agent'],
        }),
        res: (res: FastifyReply) => ({
          statusCode: res.statusCode,
        }),
      },
      ...(logger.pretty
        ? {
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: true,
                singleLine: false,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
              },
            },
          }
        : {}),
    },

    exclude: LOG_EXCLUDED_ROUTES.map((route) => ({
      method: RequestMethod.ALL,
      path: route.path,
    })),

    forRoutes: [{ path: '*path', method: RequestMethod.ALL }],
  };
}
