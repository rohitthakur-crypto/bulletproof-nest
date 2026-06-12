// Contract
export type {
  ApiErrorDebug,
  ApiErrorPayload,
  ApiErrorResponse,
  ApiMeta,
  ApiResponse,
  ApiSuccessResponse,
  ValidationDetail,
} from './contract/api-envelope.types';

export type {
  CursorPagination,
  CursorPaginatedResult,
  OffsetPagination,
  PaginatedResult,
} from './contract/paginated.types';

// Errors
export { ErrorCode } from './errors/error-code.enum';
export type { ErrorCode as ErrorCodeType } from './errors/error-code.enum';
export { errorCodeFromStatus, errorMessageFromStatus } from './errors/status-to-error-code.mapper';

// Envelope builders
export { buildSuccess } from './envelope/success.builder';
export { buildError } from './envelope/error.builder';

// HTTP helpers
export {
  extractFromExecution,
  extractFromHost,
  extractFromRequest,
  resolveStatusCode,
  type RequestContext,
} from './http/request-context';
export { sendJson } from './http/response.sender';

// Decorators
export { ApiMessage, API_MESSAGE_KEY } from './decorators/api-message.decorator';
export { SkipEnvelope, SKIP_ENVELOPE_KEY } from './decorators/skip-envelope.decorator';

// Filter & Interceptor
export { ApiExceptionFilter } from './filters/api-exception.filter';
export { ApiResponseInterceptor } from './interceptors/api-response.interceptor';
