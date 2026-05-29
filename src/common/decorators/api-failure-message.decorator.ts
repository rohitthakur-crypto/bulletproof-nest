import { SetMetadata } from '@nestjs/common';

export const API_FAILURE_MESSAGE_KEY = 'apiFailureMessage';

/**
 * Message used when the handler sets a non-2xx HTTP status (e.g. health 503).
 */
export const ApiFailureMessage = (message: string) =>
  SetMetadata(API_FAILURE_MESSAGE_KEY, message);
