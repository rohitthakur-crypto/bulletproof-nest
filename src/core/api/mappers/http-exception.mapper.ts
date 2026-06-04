import { HttpException } from '@nestjs/common';

import type { ValidationDetail } from '../contract/api-envelope.types';
import type { BuildErrorInput } from '../envelope/error.builder';
import { errorCodeFromStatus } from '../errors/status-to-error-code.mapper';
import type { RequestContext } from '../http/request-context';

import type { ExceptionMapper } from './exception-mapper.interface';

export class HttpExceptionMapper implements ExceptionMapper {
  supports(exception: unknown): boolean {
    return exception instanceof HttpException;
  }

  map(exception: unknown, ctx: RequestContext, isProduction: boolean): BuildErrorInput {
    const httpEx = exception as HttpException;
    const statusCode = httpEx.getStatus();
    const { message, code, details } = parseResponse(httpEx);

    return {
      statusCode,
      code: code ?? errorCodeFromStatus(statusCode),
      rawMessage: message,
      requestId: ctx.requestId,
      path: ctx.path,
      details,
      exception,
      isProduction,
    };
  }
}

function parseResponse(exception: HttpException): {
  message: string;
  code?: string;
  details?: ValidationDetail[];
} {
  const res = exception.getResponse();

  if (typeof res === 'string') {
    return { message: res };
  }

  const body = res as Record<string, unknown>;
  const message = extractMessage(body, exception.message);
  const code = typeof body.code === 'string' ? body.code : undefined;
  const details = normalizeDetails(body.details);

  return { message, code, details };
}

function extractMessage(body: Record<string, unknown>, fallback: string): string {
  const msg = body.message;
  if (Array.isArray(msg)) return msg.map(String).join(', ');
  if (typeof msg === 'string') return msg;
  return fallback;
}

function normalizeDetails(raw: unknown): ValidationDetail[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;

  const results: ValidationDetail[] = [];

  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue;
    const entry = item as Record<string, unknown>;

    if (typeof entry.field === 'string' && typeof entry.message === 'string') {
      results.push({ field: entry.field, message: entry.message });
      continue;
    }

    const field = Array.isArray(entry.path)
      ? entry.path.join('.')
      : typeof entry.path === 'string'
        ? entry.path
        : 'root';

    if (typeof entry.constraints === 'object' && entry.constraints !== null) {
      for (const message of Object.values(entry.constraints)) {
        results.push({ field, message: String(message) });
      }
    } else {
      results.push({
        field,
        message: typeof entry.message === 'string' ? entry.message : 'Invalid value',
      });
    }
  }

  return results.length > 0 ? results : undefined;
}
