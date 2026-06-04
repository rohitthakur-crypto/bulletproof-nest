export interface ApiMeta {
  timestamp: string;
  requestId: string;
  path: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta: ApiMeta;
}

export interface ValidationDetail {
  field: string;
  message: string;
}

export interface ApiErrorDebug {
  exception: string;
  message: string;
  stack?: string[];
}

export interface ApiErrorPayload {
  code: string;
  details?: ValidationDetail[];
  debug?: ApiErrorDebug;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error: ApiErrorPayload;
  meta: ApiMeta;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
