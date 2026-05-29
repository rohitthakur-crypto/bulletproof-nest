import { RequestMethod } from '@nestjs/common';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

export const REQUEST_ID_HEADER = 'x-request-id';

/** Paths redacted from HTTP and application logs (pino `redact`). */
export const SENSITIVE_LOG_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]',
  'req.body.password',
  'req.body.currentPassword',
  'req.body.newPassword',
  'req.body.token',
  'req.body.refreshToken',
  'req.body.accessToken',
  'req.body.secret',
  'req.body.apiKey',
  'res.headers["set-cookie"]',
  'password',
  'token',
  'refreshToken',
  'accessToken',
  'secret',
  'apiKey',
  'authorization',
] as const;

/** Routes excluded from automatic HTTP request/response logging. */
export const LOG_EXCLUDED_ROUTES = [
  { path: 'health', method: RequestMethod.ALL },
  { path: 'health/*path', method: RequestMethod.ALL },
];
