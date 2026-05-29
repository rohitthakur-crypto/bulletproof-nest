import { HttpStatus } from '@nestjs/common';

import { ErrorCode, type ErrorCode as ErrorCodeType } from '@/common/errors';

export const ERROR_MESSAGES: Readonly<Partial<Record<number, string>>> = {
  [HttpStatus.BAD_REQUEST]: 'Bad request',
  [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
  [HttpStatus.FORBIDDEN]: 'Forbidden',
  [HttpStatus.NOT_FOUND]: 'Resource not found',
  [HttpStatus.CONFLICT]: 'Conflict',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Validation failed',
  [HttpStatus.TOO_MANY_REQUESTS]: 'Too many requests',
  [HttpStatus.REQUEST_TIMEOUT]: 'Request timed out',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal server error',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'Service unavailable',
};

export const HTTP_STATUS_TO_ERROR_CODE: Readonly<
  Partial<Record<number, ErrorCodeType>>
> = {
  [HttpStatus.BAD_REQUEST]: ErrorCode.BAD_REQUEST,
  [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHORIZED,
  [HttpStatus.FORBIDDEN]: ErrorCode.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: ErrorCode.RESOURCE_NOT_FOUND,
  [HttpStatus.CONFLICT]: ErrorCode.CONFLICT,
  [HttpStatus.UNPROCESSABLE_ENTITY]: ErrorCode.VALIDATION_ERROR,
  [HttpStatus.TOO_MANY_REQUESTS]: ErrorCode.TOO_MANY_REQUESTS,
  [HttpStatus.REQUEST_TIMEOUT]: ErrorCode.REQUEST_TIMEOUT,
};

export function httpErrorCode(statusCode: number): ErrorCodeType {
  return (
    HTTP_STATUS_TO_ERROR_CODE[statusCode] ?? ErrorCode.INTERNAL_SERVER_ERROR
  );
}

export function httpErrorMessage(statusCode: number): string {
  return ERROR_MESSAGES[statusCode] ?? 'Request failed';
}

/**
 * Returns a client-safe message:
 * - 5xx always returns the generic 500 message (never expose internals)
 * - Production sanitizes 401/403/404/422 to the canonical fallback
 * - Framework noise like "Cannot GET /" is replaced with the fallback
 */
export function resolveMessage(
  statusCode: number,
  rawMessage: string | undefined,
  isProduction: boolean,
): string {
  if (statusCode >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
    return ERROR_MESSAGES[HttpStatus.INTERNAL_SERVER_ERROR]!;
  }

  const fallback = httpErrorMessage(statusCode);

  if (isProduction || !rawMessage || rawMessage.startsWith('Cannot ')) {
    return fallback;
  }

  return rawMessage;
}
