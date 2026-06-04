import { HttpStatus } from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

import type { ValidationDetail } from '../contract/api-envelope.types';
import type { BuildErrorInput } from '../envelope/error.builder';
import { ErrorCode } from '../errors/error-code.enum';
import type { RequestContext } from '../http/request-context';

import type { ExceptionMapper } from './exception-mapper.interface';

export class ZodValidationMapper implements ExceptionMapper {
  supports(exception: unknown): boolean {
    return exception instanceof ZodValidationException;
  }

  map(exception: unknown, ctx: RequestContext, isProduction: boolean): BuildErrorInput {
    const zodEx = exception as ZodValidationException;
    const zodError = zodEx.getZodError();

    return {
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      code: ErrorCode.VALIDATION_ERROR,
      rawMessage: 'Validation failed',
      requestId: ctx.requestId,
      path: ctx.path,
      details: zodError instanceof ZodError ? mapZodIssues(zodError) : undefined,
      exception,
      isProduction,
    };
  }
}

function mapZodIssues(error: ZodError): ValidationDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join('.') : 'root',
    message: issue.message,
  }));
}
