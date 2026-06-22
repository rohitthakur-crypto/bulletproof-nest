import type { BuildErrorInput } from '../envelope/error.builder';
import { ErrorCode } from '../errors/error-code.enum';
import type { RequestContext } from '../http/request-context';

import type { ExceptionMapper } from './exception-mapper.interface';

import { mapPrismaError } from '@/infra/prisma/helpers/prisma-error.mapper';

export class PrismaExceptionMapper implements ExceptionMapper {
  supports(exception: unknown): boolean {
    return mapPrismaError(exception) !== null;
  }

  map(exception: unknown, ctx: RequestContext, isProduction: boolean): BuildErrorInput {
    const mapped = mapPrismaError(exception)!;
    const isServerError = mapped.statusCode >= 500;

    return {
      statusCode: mapped.statusCode,
      code: isProduction && isServerError ? ErrorCode.INTERNAL_SERVER_ERROR : mapped.code,
      rawMessage: isProduction && isServerError ? undefined : mapped.message,
      requestId: ctx.requestId,
      path: ctx.path,
      details: isProduction && isServerError ? undefined : mapped.details,
      exception,
      isProduction,
    };
  }
}
