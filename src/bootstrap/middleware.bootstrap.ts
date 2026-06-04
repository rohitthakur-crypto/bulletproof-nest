import { INestApplication } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

/**
 * NestJS route middleware is registered in AppModule.configure().
 * pino-http (nestjs-pino) attaches req.log and request IDs before this runs.
 */
export function setupMiddlewares(app: INestApplication): void {
  const logger = app.get(Logger);

  /**
   * Add global middlewares here via app.use(...)
   *
   * Example:
   * app.use(new AuthMiddleware());
   */

  logger.log('Middlewares initialized', 'MiddlewareBootstrap');
}
