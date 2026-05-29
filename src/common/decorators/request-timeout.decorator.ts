import { SetMetadata } from '@nestjs/common';

export const REQUEST_TIMEOUT_MS_KEY = 'requestTimeoutMs';

export const SKIP_REQUEST_TIMEOUT_KEY = 'skipRequestTimeout';

/** Override the global request timeout for a specific route (milliseconds). */
export const RequestTimeout = (ms: number) =>
  SetMetadata(REQUEST_TIMEOUT_MS_KEY, ms);

/** Disable the global request timeout for a specific route. */
export const SkipRequestTimeout = () =>
  SetMetadata(SKIP_REQUEST_TIMEOUT_KEY, true);
