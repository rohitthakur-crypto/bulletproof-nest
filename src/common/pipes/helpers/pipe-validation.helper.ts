import { UnprocessableEntityException } from '@nestjs/common';

import { ErrorCode } from '@/core/api';
import type { ValidationDetail } from '@/core/api';

export function throwPipeValidationError(field: string, message: string): never {
  const details: ValidationDetail[] = [{ field, message }];

  throw new UnprocessableEntityException({
    message: 'Validation failed',
    code: ErrorCode.VALIDATION_ERROR,
    details,
  });
}
