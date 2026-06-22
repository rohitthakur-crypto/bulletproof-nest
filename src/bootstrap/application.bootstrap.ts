import type { INestApplication } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

import { setupApp } from './app.bootstrap';
import { setupFastify } from './fastify.bootstrap';
import { setupFilters } from './filter.bootstrap';
import { setupGuards } from './guard.bootstrap';
import { setupInterceptors } from './interceptor.bootstrap';
import { setupLogger } from './logger.bootstrap';
import { setupMiddlewares } from './middleware.bootstrap';
import { setupSwagger } from './swagger.bootstrap';
import { setupValidation } from './validation.bootstrap';

import { AppConfigService } from '@/core/config/services/app-config.service';

/**
 * Application bootstrap pipeline.
 *
 * Order matters — each phase builds on the previous one:
 *
 * 1. App        — global prefix, URI versioning
 * 2. Fastify    — helmet, CORS, compression, cookies
 * 3. Middleware — RequestLoggerMiddleware (AppModule) + pino-http request IDs
 * 4. Logger     — structured logging (buffered logs flushed)
 * 5. Validation — global Zod validation pipe
 * 6. Interceptors — serializer → logging → response envelope
 * 7. Filters    — unified exception envelope
 * 8. Guards     — global auth / role guards (when added)
 * 9. Swagger    — OpenAPI docs
 */
export async function configureApplication(app: INestApplication): Promise<void> {
  const config = app.get(AppConfigService);

  setupApp(app);
  await setupFastify(app as NestFastifyApplication, config);
  setupMiddlewares(app);
  setupLogger(app);
  setupValidation(app);
  setupInterceptors(app);
  setupFilters(app);
  setupGuards(app);
  setupSwagger(app);
}
