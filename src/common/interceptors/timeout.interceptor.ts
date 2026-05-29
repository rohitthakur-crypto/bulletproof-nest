import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { catchError, throwError, timeout, TimeoutError } from 'rxjs';

import {
  REQUEST_TIMEOUT_MS_KEY,
  SKIP_REQUEST_TIMEOUT_KEY,
} from '@/common/decorators';
import { AppConfigService } from '@/config';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: AppConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const skipTimeout = this.reflector.getAllAndOverride<boolean>(
      SKIP_REQUEST_TIMEOUT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipTimeout) {
      return next.handle();
    }

    const routeTimeoutMs = this.reflector.getAllAndOverride<number>(
      REQUEST_TIMEOUT_MS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const timeoutMs = routeTimeoutMs ?? this.config.app.requestTimeoutMs;

    return next.handle().pipe(
      timeout(timeoutMs),

      catchError((error: unknown) => {
        if (error instanceof TimeoutError) {
          return throwError(
            () =>
              new RequestTimeoutException(
                `Request timed out after ${timeoutMs}ms`,
              ),
          );
        }

        return throwError(() => error);
      }),
    );
  }
}
