import compress from '@fastify/compress';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

import { CORS_ALLOWED_METHODS } from '@/common/enums';
import type { AppConfigService } from '@/config';

/**
 * Fastify-native security and transport plugins.
 * Replaces Express middleware (helmet, compression, cookie-parser, enableCors).
 */
export async function setupFastify(
  app: NestFastifyApplication,
  config: AppConfigService,
): Promise<void> {
  await app.register(helmet);

  await app.register(cors, {
    origin: [...config.app.corsOrigins],
    credentials: true,
    methods: CORS_ALLOWED_METHODS,
  });

  await app.register(compress);

  await app.register(cookie);
}
