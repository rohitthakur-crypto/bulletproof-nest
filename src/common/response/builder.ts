import { HttpStatus } from '@nestjs/common';

import { httpErrorCode, httpErrorMessage, resolveMessage } from './constants';
import type {
  ApiErrorDebug,
  ApiErrorResponse,
  ApiResponseMeta,
  ApiSuccessResponse,
  BuildErrorFromExceptionInput,
  BuildErrorInput,
  BuildSuccessInput,
} from './types';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export function buildMeta(input: {
  requestId: string;
  path?: string;
  extra?: Record<string, unknown>;
}): ApiResponseMeta {
  const { extra, requestId, path } = input;

  return {
    timestamp: new Date().toISOString(),
    requestId,
    ...(path !== undefined ? { path } : {}),
    ...(extra ?? {}),
  };
}

// ---------------------------------------------------------------------------
// Success
// ---------------------------------------------------------------------------

export function buildSuccessResponse<T>(
  input: BuildSuccessInput<T>,
): ApiSuccessResponse<T> {
  return {
    success: true,
    statusCode: input.statusCode,
    message: input.message,
    data: input.data,
    meta: buildMeta({
      requestId: input.requestId,
      path: input.path,
      extra: input.extraMeta,
    }),
  };
}

export function successMessage(statusCode: number): string {
  if (statusCode === Number(HttpStatus.CREATED)) {
    return 'Resource created successfully';
  }

  return 'Request completed successfully';
}

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

export function buildErrorResponse(input: BuildErrorInput): ApiErrorResponse {
  const { statusCode, message, code, requestId, path, details, debug } = input;

  return {
    success: false,
    statusCode,
    message,
    error: {
      code,
      ...(details !== undefined ? { details } : {}),
      ...(debug !== undefined ? { debug } : {}),
    },
    meta: buildMeta({ requestId, path }),
  };
}

export function failureMessage(statusCode: number): string {
  return httpErrorMessage(statusCode);
}

export { httpErrorCode as resolveErrorCode };

// ---------------------------------------------------------------------------
// Exception → error response
// ---------------------------------------------------------------------------

export function buildErrorFromException(
  input: BuildErrorFromExceptionInput,
): ApiErrorResponse {
  return buildErrorResponse({
    statusCode: input.statusCode,
    message: resolveMessage(
      input.statusCode,
      input.rawMessage,
      input.isProduction,
    ),
    code: input.code,
    requestId: input.requestId,
    path: input.path,
    details: input.details,
    debug: buildDebug(input.exception, input.isProduction),
  });
}

/**
 * Builds a lean debug block for development.
 *
 * Stack is filtered to app-only frames (no node_modules, no absolute system paths)
 * and capped at 5 lines to stay readable without leaking infrastructure details.
 */
function buildDebug(
  exception: unknown,
  isProduction: boolean,
): ApiErrorDebug | undefined {
  if (isProduction || !(exception instanceof Error)) {
    return undefined;
  }

  const appFrames = filterStack(exception.stack);

  return {
    exception: exception.name,
    message: exception.message,
    ...(appFrames.length > 0 ? { stack: appFrames } : {}),
  };
}

/**
 * Removes noise from stack traces:
 * - Strips node_modules frames (framework internals, Prisma engine, etc.)
 * - Strips absolute system paths (server machine paths)
 * - Keeps max 5 app frames
 */
function filterStack(raw: string | undefined): string[] {
  if (!raw) return [];

  return raw
    .split('\n')
    .filter((line) => line.includes(' at '))
    .map((line) => line.trim())
    .filter((line) => !line.includes('node_modules'))
    .filter((line) => !isSystemPath(line))
    .slice(0, 5);
}

/** Returns true for lines pointing to system-level paths outside the project. */
function isSystemPath(line: string): boolean {
  return (
    line.includes('/usr/') ||
    line.includes('/home/') ||
    line.includes('\\Windows\\') ||
    line.includes('internal/') ||
    (line.includes(':\\') && !line.includes('src\\'))
  );
}
