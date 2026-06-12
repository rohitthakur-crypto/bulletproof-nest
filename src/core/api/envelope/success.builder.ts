import type { ApiMeta, ApiSuccessResponse } from '../contract/api-envelope.types';

export interface BuildSuccessInput<T> {
  statusCode: number;
  message: string;
  data: T;
  requestId: string;
  path: string;
}

export function buildSuccess<T>(input: BuildSuccessInput<T>): ApiSuccessResponse<T> {
  return {
    success: true,
    statusCode: input.statusCode,
    message: input.message,
    data: input.data,
    meta: buildMeta(input.requestId, input.path),
  };
}

function buildMeta(requestId: string, path: string): ApiMeta {
  return { timestamp: new Date().toISOString(), requestId, path };
}
