import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { ZodSerializationException, ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

import { Environment } from '@/common/enums';
import { ErrorCode, type ErrorCode as ErrorCodeType } from '@/common/errors';
import {
  buildErrorFromException,
  mapZodErrors,
  resolveErrorCode,
  type ValidationDetail,
} from '@/common/response';
import { getRequestContextFromHost } from '@/common/utils/request-context.util';
import { AppConfigService } from '@/config';
import { mapPrismaError } from '@/infra/prisma';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly config: AppConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const reply = host.switchToHttp().getResponse<FastifyReply>();
    const ctx = getRequestContextFromHost(host);
    const isProd = this.config.app.env === Environment.Production;

    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError();

      if (zodError instanceof ZodError) {
        const statusCode = HttpStatus.UNPROCESSABLE_ENTITY;

        this.logWarn(statusCode, 'Validation failed', ctx);
        this.send(reply, {
          statusCode,
          code: ErrorCode.VALIDATION_ERROR,
          rawMessage: 'Validation failed',
          requestId: ctx.requestId,
          path: ctx.path,
          details: mapZodErrors(zodError),
          exception,
          isProduction: isProd,
        });

        return;
      }
    }

    if (exception instanceof ZodSerializationException) {
      const zodError = exception.getZodError();
      const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

      this.logError(
        statusCode,
        zodError instanceof ZodError
          ? zodError.message
          : 'Response serialization failed',
        ctx,
        exception,
      );
      this.send(reply, {
        statusCode,
        code: ErrorCode.SERIALIZATION_ERROR,
        rawMessage: 'Response serialization failed',
        requestId: ctx.requestId,
        path: ctx.path,
        exception,
        isProduction: isProd,
      });

      return;
    }

    const prismaError = mapPrismaError(exception);

    if (prismaError) {
      const isServerError = prismaError.statusCode >= 500;

      if (isServerError) {
        this.logError(
          prismaError.statusCode,
          prismaError.message,
          ctx,
          exception,
        );
      } else {
        this.logWarn(prismaError.statusCode, prismaError.message, ctx);
      }

      this.send(reply, {
        statusCode: prismaError.statusCode,
        code:
          isProd && isServerError
            ? ErrorCode.INTERNAL_SERVER_ERROR
            : prismaError.code,
        rawMessage: isProd && isServerError ? undefined : prismaError.message,
        requestId: ctx.requestId,
        path: ctx.path,
        details: isProd && isServerError ? undefined : prismaError.details,
        exception,
        isProduction: isProd,
      });

      return;
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const { rawMessage, code, details } = this.parseHttpException(exception);

      if (statusCode >= 500) {
        this.logError(statusCode, exception.message, ctx, exception);
      } else {
        this.logWarn(statusCode, exception.message, ctx);
      }

      this.send(reply, {
        statusCode,
        code,
        rawMessage,
        requestId: ctx.requestId,
        path: ctx.path,
        details,
        exception,
        isProduction: isProd,
      });

      return;
    }

    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    this.logError(
      statusCode,
      exception instanceof Error ? exception.message : 'Unknown error',
      ctx,
      exception,
    );

    this.send(reply, {
      statusCode,
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      requestId: ctx.requestId,
      path: ctx.path,
      exception,
      isProduction: isProd,
    });
  }

  private send(
    reply: FastifyReply,
    input: Parameters<typeof buildErrorFromException>[0],
  ): void {
    const payload = buildErrorFromException(input);
    reply.status(payload.statusCode).send(payload);
  }

  private parseHttpException(exception: HttpException): {
    rawMessage: string;
    code: ErrorCodeType;
    details?: ValidationDetail[];
  } {
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    let rawMessage = exception.message;

    if (typeof exceptionResponse === 'string') {
      rawMessage = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const body = exceptionResponse as Record<string, unknown>;
      const msg = body.message;

      if (Array.isArray(msg)) {
        rawMessage = msg.map(String).join(', ');
      } else if (typeof msg === 'string') {
        rawMessage = msg;
      } else if (typeof msg === 'number') {
        rawMessage = String(msg);
      } else {
        rawMessage = exception.message;
      }
    }

    const code =
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      typeof (exceptionResponse as Record<string, unknown>).code === 'string'
        ? ((exceptionResponse as Record<string, unknown>).code as ErrorCodeType)
        : resolveErrorCode(statusCode);

    const rawDetails =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as Record<string, unknown>).details
        : undefined;

    return {
      rawMessage,
      code,
      details: this.normalizeDetails(rawDetails),
    };
  }

  /**
   * Normalizes arbitrary detail shapes into `ValidationDetail[]`.
   * Handles both the standard `[{ field, message }]` array and
   * NestJS class-validator's `[{ path, constraints }]` format.
   */
  private normalizeDetails(raw: unknown): ValidationDetail[] | undefined {
    if (!Array.isArray(raw) || raw.length === 0) return undefined;

    const results: ValidationDetail[] = [];

    for (const item of raw) {
      if (typeof item !== 'object' || item === null) continue;

      const entry = item as Record<string, unknown>;

      // Standard { field, message } shape
      if (
        typeof entry.field === 'string' &&
        typeof entry.message === 'string'
      ) {
        results.push({ field: entry.field, message: entry.message });
        continue;
      }

      // class-validator / nestjs-zod { path, constraints } shape
      const pathParts = entry.path;
      const field = Array.isArray(pathParts)
        ? pathParts.join('.')
        : typeof pathParts === 'string'
          ? pathParts
          : 'root';

      if (typeof entry.constraints === 'object' && entry.constraints !== null) {
        for (const message of Object.values(entry.constraints)) {
          results.push({ field, message: String(message) });
        }
      } else {
        let message = 'Invalid value';

        if (typeof entry.message === 'string') {
          message = entry.message;
        } else if (typeof entry.message === 'number') {
          message = String(entry.message);
        }

        results.push({ field, message });
      }
    }

    return results.length > 0 ? results : undefined;
  }

  private logWarn(
    statusCode: number,
    message: string,
    ctx: ReturnType<typeof getRequestContextFromHost>,
  ): void {
    this.logger.warn(
      `${message} (${statusCode}) ${ctx.path} [${ctx.requestId}]`,
    );
  }

  private logError(
    statusCode: number,
    message: string,
    ctx: ReturnType<typeof getRequestContextFromHost>,
    exception: unknown,
  ): void {
    this.logger.error(
      `${message} (${statusCode}) ${ctx.path} [${ctx.requestId}]`,
      exception instanceof Error ? exception.stack : undefined,
    );
  }
}
