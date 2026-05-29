import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyReply } from 'fastify';
import { map } from 'rxjs';

import { API_FAILURE_MESSAGE_KEY } from '@/common/decorators/api-failure-message.decorator';
import { API_SUCCESS_MESSAGE_KEY } from '@/common/decorators/api-success-message.decorator';
import { SKIP_RESPONSE_TRANSFORM_KEY } from '@/common/decorators/skip-response-transform.decorator';
import {
  buildSuccessResponse,
  failureMessage,
  normalizeHandlerResult,
  successMessage,
} from '@/common/response';
import {
  getRequestContextFromExecution,
  resolveHttpStatusFromContext,
} from '@/common/utils/request-context.util';

/**
 * Wraps every successful handler response in the API envelope.
 *
 * Handler return shapes:
 *  - Plain value              → { data: value }
 *  - { data, meta? }          → { data, extraMeta: meta }
 *  - Already-wrapped response → pass through (guard via isApiResponse)
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    if (
      this.reflector.getAllAndOverride<boolean>(SKIP_RESPONSE_TRANSFORM_KEY, [
        context.getHandler(),
        context.getClass(),
      ])
    ) {
      return next.handle();
    }

    const requestContext = getRequestContextFromExecution(context);
    const httpResponse = context.switchToHttp().getResponse<FastifyReply>();

    return next.handle().pipe(
      map((body) => {
        const { data, extraMeta, httpStatus } = normalizeHandlerResult(body);

        if (httpStatus !== undefined) {
          httpResponse.status(httpStatus);
        }

        const statusCode = resolveHttpStatusFromContext(context);

        const customSuccess = this.reflector.getAllAndOverride<string>(
          API_SUCCESS_MESSAGE_KEY,
          [context.getHandler(), context.getClass()],
        );
        const customFailure = this.reflector.getAllAndOverride<string>(
          API_FAILURE_MESSAGE_KEY,
          [context.getHandler(), context.getClass()],
        );

        const message =
          statusCode >= 400
            ? (customFailure ?? failureMessage(statusCode))
            : (customSuccess ?? successMessage(statusCode));

        return buildSuccessResponse({
          statusCode,
          message,
          data,
          requestId: requestContext.requestId,
          path: requestContext.path,
          extraMeta,
        });
      }),
    );
  }
}
