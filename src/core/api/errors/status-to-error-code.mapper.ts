import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from './error-code.enum';

const STATUS_TO_CODE: Partial<Record<number, ErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: ErrorCode.BAD_REQUEST,
  [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHORIZED,
  [HttpStatus.FORBIDDEN]: ErrorCode.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: ErrorCode.RESOURCE_NOT_FOUND,
  [HttpStatus.CONFLICT]: ErrorCode.CONFLICT,
  [HttpStatus.UNPROCESSABLE_ENTITY]: ErrorCode.VALIDATION_ERROR,
  [HttpStatus.TOO_MANY_REQUESTS]: ErrorCode.TOO_MANY_REQUESTS,
  [HttpStatus.REQUEST_TIMEOUT]: ErrorCode.REQUEST_TIMEOUT,
};

const STATUS_TO_MESSAGE: Partial<Record<number, string>> = {
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

export function errorCodeFromStatus(statusCode: number): ErrorCode {
  return STATUS_TO_CODE[statusCode] ?? ErrorCode.INTERNAL_SERVER_ERROR;
}

export function errorMessageFromStatus(statusCode: number): string {
  return STATUS_TO_MESSAGE[statusCode] ?? 'Request failed';
}

export function resolveErrorMessage(
  statusCode: number,
  rawMessage: string | undefined,
  isProduction: boolean,
): string {
  if (statusCode >= 500) {
    return STATUS_TO_MESSAGE[HttpStatus.INTERNAL_SERVER_ERROR]!;
  }

  const fallback = errorMessageFromStatus(statusCode);

  if (isProduction || !rawMessage || rawMessage.startsWith('Cannot ')) {
    return fallback;
  }

  return rawMessage;
}
