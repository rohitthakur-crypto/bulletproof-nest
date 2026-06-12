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
  // Swagger UI requires inline scripts/styles — default Helmet CSP blocks them on Fastify.
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `'unsafe-inline'`],
      },
    },
  });

  await app.register(cors, {
    origin: [...config.app.corsOrigins],
    credentials: true,
    methods: CORS_ALLOWED_METHODS,
  });

  await app.register(compress);

  await app.register(cookie);
}
