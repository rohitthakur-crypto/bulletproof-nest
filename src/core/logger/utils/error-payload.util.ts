import type { LogErrorPayload } from '../logger.types';

export function toErrorPayload(
  error: Error | LogErrorPayload,
): LogErrorPayload {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: (error as NodeJS.ErrnoException).code,
    };
  }

  return error;
}
