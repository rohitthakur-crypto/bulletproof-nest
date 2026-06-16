import { z } from 'zod';

import { LogLevel } from '@/core/logger/enums';

export const loggerEnvSchema = z.object({
  LOG_LEVEL: z.enum(LogLevel).optional(),

  LOG_PRETTY: z.coerce.boolean().optional(),

  LOG_HTTP_AUTO: z.coerce.boolean().optional(),
});
