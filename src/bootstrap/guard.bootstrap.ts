import { INestApplication } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

export function setupGuards(app: INestApplication): void {
  const logger = app.get(Logger);

  /**
   * Add global guards here via app.useGlobalGuards(...)
   *
   * Example:
   * app.useGlobalGuards(new AuthGuard(), new RolesGuard());
   */

  logger.log('Guards initialized', 'GuardBootstrap');
}
