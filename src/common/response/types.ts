import type { ErrorCode } from '@/common/errors';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export interface ApiResponseMeta {
  timestamp: string;
  requestId: string;
  path?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Success
// ---------------------------------------------------------------------------

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta: ApiResponseMeta;
}

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

/** Dev-only — stripped entirely in production. */
export interface ApiErrorDebug {
  /** Exception class name, e.g. NotFoundException */
  exception: string;
  /** Short, readable error message */
  message: string;
  /**
   * App-only stack frames — node_modules and absolute system paths filtered out.
   * Present only when there are relevant frames.
   */
  stack?: string[];
}

/** One validation violation for a single field. */
export interface ValidationDetail {
  field: string;
  message: string;
}

export interface ApiErrorPayload {
  code: ErrorCode;
  /** Validation-specific field errors */
  details?: ValidationDetail[];
  /** Dev/staging only — never present in production */
  debug?: ApiErrorDebug;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error: ApiErrorPayload;
  meta: ApiResponseMeta;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface OffsetPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CursorPaginationMeta {
  limit: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export type PaginationMeta = OffsetPaginationMeta | CursorPaginationMeta;

// ---------------------------------------------------------------------------
// Service return contract
// ---------------------------------------------------------------------------

/**
 * Services return this when they need to pass pagination or other metadata
 * alongside the payload. For plain data, return it directly.
 *
 * @example
 * return { data: users, meta: { page: 1, limit: 10, total: 42, totalPages: 5 } };
 */
export interface ServiceResult<
  TData = unknown,
  TMeta extends Record<string, unknown> = Record<string, unknown>,
> {
  data: TData;
  meta?: TMeta;
  /** Override the HTTP status (e.g. 503 from health checks). */
  httpStatus?: number;
}

// ---------------------------------------------------------------------------
// Builder inputs
// ---------------------------------------------------------------------------

export interface BuildSuccessInput<T> {
  statusCode: number;
  message: string;
  data: T;
  requestId: string;
  path?: string;
  extraMeta?: Record<string, unknown>;
}

export interface BuildErrorInput {
  statusCode: number;
  message: string;
  code: ErrorCode;
  requestId: string;
  path?: string;
  details?: ValidationDetail[];
  debug?: ApiErrorDebug;
}

export interface BuildErrorFromExceptionInput {
  statusCode: number;
  code: ErrorCode;
  rawMessage?: string;
  requestId: string;
  path?: string;
  details?: ValidationDetail[];
  exception: unknown;
  isProduction: boolean;
}
