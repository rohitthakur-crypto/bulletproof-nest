import type { ZodError } from 'zod';

import type { ValidationDetail } from './types';

/**
 * Maps Zod issues into the standard `[{ field, message }]` array.
 * Multiple issues for the same field produce multiple entries.
 * Never returns raw Zod objects.
 */
export function mapZodErrors(error: ZodError): ValidationDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join('.') : 'root',
    message: issue.message,
  }));
}
