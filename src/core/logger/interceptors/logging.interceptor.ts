import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { LoggerFactory } from '../logger.factory';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggerFactory: LoggerFactory) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<{
      method?: string;
      url?: string;
      id?: string;
    }>();
    const handler = context.getHandler().name;
    const controller = context.getClass().name;
    const logger = this.loggerFactory.create(LoggingInterceptor.name, {
      controller,
      handler,
      correlationId: request.id,
    });

    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          logger.debug('Handler completed', {
            method: request.method,
            url: request.url,
            durationMs: Date.now() - startedAt,
          });
        },
        error: (error: Error) => {
          logger.error(
            'Handler failed',
            {
              method: request.method,
              url: request.url,
              durationMs: Date.now() - startedAt,
            },
            error,
          );
        },
      }),
    );
  }
}
