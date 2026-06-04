import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import type { FastifyReply } from 'fastify';

import { buildError } from '../envelope/error.builder';
import { extractFromHost } from '../http/request-context';
import { sendJson } from '../http/response.sender';
import type { ExceptionMapper } from '../mappers/exception-mapper.interface';
import { FallbackExceptionMapper } from '../mappers/fallback.mapper';
import { HttpExceptionMapper } from '../mappers/http-exception.mapper';
import { PrismaExceptionMapper } from '../mappers/prisma.mapper';
import { ZodSerializationMapper } from '../mappers/zod-serialization.mapper';
import { ZodValidationMapper } from '../mappers/zod-validation.mapper';

import { Environment } from '@/common/enums';
import { AppConfigService } from '@/config';

const mappers: ExceptionMapper[] = [
  new ZodValidationMapper(),
  new ZodSerializationMapper(),
  new PrismaExceptionMapper(),
  new HttpExceptionMapper(),
];

const fallback = new FallbackExceptionMapper();

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  constructor(private readonly config: AppConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = extractFromHost(host);
    const reply = host.switchToHttp().getResponse<FastifyReply>();
    const isProd = this.config.app.env === Environment.Production;

    const mapper = mappers.find((m) => m.supports(exception)) ?? fallback;
    const input = mapper.map(exception, ctx, isProd);
    const payload = buildError(input);

    if (payload.statusCode >= 500) {
      this.logger.error(
        `${payload.message} (${payload.statusCode}) ${ctx.path} [${ctx.requestId}]`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`${payload.message} (${payload.statusCode}) ${ctx.path} [${ctx.requestId}]`);
    }

    sendJson(reply, payload.statusCode, payload);
  }
}
