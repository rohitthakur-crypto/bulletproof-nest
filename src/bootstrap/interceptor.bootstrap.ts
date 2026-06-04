import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ZodSerializerInterceptor } from 'nestjs-zod';

import { TimeoutInterceptor } from '@/common/interceptors';
import { ApiResponseInterceptor } from '@/core/api';
import { LoggingInterceptor } from '@/core/logger';

export function setupInterceptors(app: INestApplication): void {
  app.useGlobalInterceptors(
    new ApiResponseInterceptor(app.get(Reflector)),
    app.get(LoggingInterceptor),
    new ZodSerializerInterceptor(app.get(Reflector)),
    app.get(TimeoutInterceptor),
  );
}
