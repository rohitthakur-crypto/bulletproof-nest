import { HttpStatus } from '@nestjs/common';

import type { BuildErrorInput } from '../envelope/error.builder';
import { ErrorCode } from '../errors/error-code.enum';
import type { RequestContext } from '../http/request-context';

import type { ExceptionMapper } from './exception-mapper.interface';

export class FallbackExceptionMapper implements ExceptionMapper {
  supports(): boolean {
    return true;
  }

  map(exception: unknown, ctx: RequestContext, isProduction: boolean): BuildErrorInput {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      requestId: ctx.requestId,
      path: ctx.path,
      exception,
      isProduction,
    };
  }
}
