// Types
export type {
  ApiErrorDebug,
  ApiErrorPayload,
  ApiErrorResponse,
  ApiResponse,
  ApiResponseMeta,
  ApiSuccessResponse,
  BuildErrorFromExceptionInput,
  BuildErrorInput,
  BuildSuccessInput,
  CursorPaginationMeta,
  OffsetPaginationMeta,
  PaginationMeta,
  ServiceResult,
  ValidationDetail,
} from './types';

export type { HandlerResult as NormalizedHandlerResult } from './normalize';

// Constants + resolvers
// Constants + resolvers
export {
  ERROR_MESSAGES,
  HTTP_STATUS_TO_ERROR_CODE,
  httpErrorCode,
  httpErrorMessage,
  resolveMessage,
} from './constants';

// Builders
export {
  buildErrorFromException,
  buildErrorResponse,
  buildMeta,
  buildSuccessResponse,
  failureMessage,
  resolveErrorCode,
  successMessage,
} from './builder';

// Normalization
export {
  isApiResponse,
  isServiceResult,
  normalizeHandlerResult,
} from './normalize';

// Mappers
export { mapZodErrors } from './zod.mapper';
