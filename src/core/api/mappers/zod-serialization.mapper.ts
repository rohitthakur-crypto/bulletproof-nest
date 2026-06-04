import { HttpStatus } from '@nestjs/common';
import { ZodSerializationException } from 'nestjs-zod';

import type { BuildErrorInput } from '../envelope/error.builder';
import { ErrorCode } from '../errors/error-code.enum';
import type { RequestContext } from '../http/request-context';

import type { ExceptionMapper } from './exception-mapper.interface';

export class ZodSerializationMapper implements ExceptionMapper {
  supports(exception: unknown): boolean {
    return exception instanceof ZodSerializationException;
  }

  map(exception: unknown, ctx: RequestContext, isProduction: boolean): BuildErrorInput {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCode.SERIALIZATION_ERROR,
      rawMessage: 'Response serialization failed',
      requestId: ctx.requestId,
      path: ctx.path,
      exception,
      isProduction,
    };
  }
}
