import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map } from 'rxjs';

import { API_MESSAGE_KEY } from '../decorators/api-message.decorator';
import { SKIP_ENVELOPE_KEY } from '../decorators/skip-envelope.decorator';
import { buildSuccess } from '../envelope/success.builder';
import { extractFromExecution, resolveStatusCode } from '../http/request-context';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_ENVELOPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skip) return next.handle();

    const ctx = extractFromExecution(context);

    return next.handle().pipe(
      map((data: unknown) => {
        const statusCode = resolveStatusCode(context);

        const customMessage = this.reflector.getAllAndOverride<string | undefined>(
          API_MESSAGE_KEY,
          [context.getHandler(), context.getClass()],
        );

        return buildSuccess({
          statusCode,
          message: customMessage ?? 'success',
          data: data ?? null,
          requestId: ctx.requestId,
          path: ctx.path,
        });
      }),
    );
  }
}
