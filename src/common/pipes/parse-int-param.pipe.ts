import { Injectable, PipeTransform } from '@nestjs/common';

import { throwPipeValidationError } from './helpers/pipe-validation.helper';

@Injectable()
export class ParseIntParamPipe implements PipeTransform<string, number> {
  constructor(private readonly field = 'id') {}

  transform(value: string): number {
    const parsed = Number(value);

    if (!Number.isInteger(parsed)) {
      throwPipeValidationError(this.field, 'Invalid integer');
    }

    return parsed;
  }
}
