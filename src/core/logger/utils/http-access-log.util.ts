import type { IncomingMessage, ServerResponse } from 'node:http';

import type { FastifyRequest } from 'fastify';

import { LogLevel } from '@/core/logger/enums';

export interface HttpAccessLogPayload {
  requestId: string;
  correlationId: string;
  method: string;
  url: string;
  statusCode: number;
  durationMs: number;
  ip: string | undefined;
  userAgent: string | undefined;
}

export function resolveClientIp(req: IncomingMessage): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];

  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim();
  }

  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0]?.trim();
  }

  return req.socket?.remoteAddress ?? undefined;
}

export function resolveRequestUrl(req: IncomingMessage): string {
  return req.url ?? '/';
}

export function shouldExcludeHttpLog(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  const path = url.split('?')[0] ?? url;

  return path === '/health' || path.startsWith('/health/');
}

export function resolveHttpLogLevel(statusCode: number, hasError = false): LogLevel {
  if (hasError || statusCode >= 500) {
    return LogLevel.Error;
  }

  if (statusCode >= 400) {
    return LogLevel.Warn;
  }

  return LogLevel.Info;
}

export function buildHttpAccessLog(input: {
  req: FastifyRequest | import('node:http').IncomingMessage;
  incoming: import('node:http').IncomingMessage;
  res: ServerResponse;
  durationMs: number;
  requestId: string;
}): HttpAccessLogPayload {
  const { req, incoming, res, durationMs, requestId } = input;

  return {
    requestId,
    correlationId: requestId,
    method: req.method ?? incoming.method ?? 'UNKNOWN',
    url: resolveRequestUrl(incoming),
    statusCode: res.statusCode,
    durationMs,
    ip: resolveClientIp(incoming),
    userAgent: req.headers['user-agent'],
  };
}

export function formatHttpAccessMessage(payload: HttpAccessLogPayload): string {
  return `${payload.method} ${payload.url} ${payload.statusCode} ${payload.durationMs}ms`;
}
