/**
 * Machine-readable API error codes.
 * Use these in clients for branching — never rely on HTTP status or message text alone.
 */
export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  ZOD_VALIDATION_ERROR: 'ZOD_VALIDATION_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  CONFLICT: 'CONFLICT',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  SERIALIZATION_ERROR: 'SERIALIZATION_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/** @deprecated Use RESOURCE_NOT_FOUND */
export const LegacyErrorCode = {
  NOT_FOUND: ErrorCode.RESOURCE_NOT_FOUND,
} as const;
