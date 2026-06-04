import type {
  ApiErrorDebug,
  ApiErrorResponse,
  ApiMeta,
  ValidationDetail,
} from '../contract/api-envelope.types';
import { resolveErrorMessage } from '../errors/status-to-error-code.mapper';

export interface BuildErrorInput {
  statusCode: number;
  code: string;
  rawMessage?: string;
  requestId: string;
  path: string;
  details?: ValidationDetail[];
  exception?: unknown;
  isProduction: boolean;
}

export function buildError(input: BuildErrorInput): ApiErrorResponse {
  const debug = buildDebug(input.exception, input.isProduction);

  return {
    success: false,
    statusCode: input.statusCode,
    message: resolveErrorMessage(input.statusCode, input.rawMessage, input.isProduction),
    error: {
      code: input.code,
      ...(input.details ? { details: input.details } : {}),
      ...(debug ? { debug } : {}),
    },
    meta: buildMeta(input.requestId, input.path),
  };
}

function buildMeta(requestId: string, path: string): ApiMeta {
  return { timestamp: new Date().toISOString(), requestId, path };
}

function buildDebug(exception: unknown, isProduction: boolean): ApiErrorDebug | undefined {
  if (isProduction || !(exception instanceof Error)) return undefined;

  const stack = (exception.stack ?? '')
    .split('\n')
    .filter((l) => l.includes(' at '))
    .map((l) => l.trim())
    .filter((l) => !l.includes('node_modules'))
    .slice(0, 5);

  return {
    exception: exception.name,
    message: exception.message,
    ...(stack.length > 0 ? { stack } : {}),
  };
}
