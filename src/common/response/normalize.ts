import type {
  ApiResponseMeta,
  ApiSuccessResponse,
  ServiceResult,
} from './types';

/** Guards against double-wrapping an already-built API response. */
export function isApiResponse(value: unknown): value is ApiSuccessResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    'data' in value &&
    'meta' in value &&
    !('error' in value)
  );
}

/** Guards a `{ data, meta? }` service return. */
export function isServiceResult(
  value: unknown,
): value is ServiceResult<unknown, Record<string, unknown>> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as ServiceResult;

  return (
    'data' in candidate && !('success' in candidate) && !('error' in candidate)
  );
}

export interface HandlerResult<T> {
  data: T;
  extraMeta?: Record<string, unknown>;
  httpStatus?: number;
}

/**
 * Maps whatever a handler returned into a normalized `{ data, extraMeta?, httpStatus? }`.
 *
 * Supported shapes:
 * - Plain value             → `{ data: value }`
 * - `{ data, meta? }`       → `{ data, extraMeta: meta }`
 * - Already-wrapped response → unwrap data + strip envelope meta
 */
export function normalizeHandlerResult<T>(body: unknown): HandlerResult<T> {
  if (body === undefined) {
    return { data: null as T };
  }

  if (isApiResponse(body)) {
    return {
      data: body.data as T,
      extraMeta: stripEnvelopeMeta(body.meta),
    };
  }

  if (isServiceResult(body)) {
    return {
      data: body.data as T,
      extraMeta: body.meta,
      httpStatus: body.httpStatus,
    };
  }

  return { data: body as T };
}

function stripEnvelopeMeta(
  meta: ApiResponseMeta,
): Record<string, unknown> | undefined {
  const { timestamp, requestId, path, ...rest } = meta;
  void timestamp;
  void requestId;
  void path;

  return Object.keys(rest).length > 0 ? rest : undefined;
}
