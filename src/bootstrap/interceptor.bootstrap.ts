import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ZodSerializerInterceptor } from 'nestjs-zod';

import { TimeoutInterceptor } from '@/common/interceptors/timeout.interceptor';
import { ApiResponseInterceptor } from '@/core/api/interceptors/api-response.interceptor';
import { LoggingInterceptor } from '@/core/logger/interceptors/logging.interceptor';

export function setupInterceptors(app: INestApplication): void {
  app.useGlobalInterceptors(
    new ApiResponseInterceptor(app.get(Reflector)),
    app.get(LoggingInterceptor),
    new ZodSerializerInterceptor(app.get(Reflector)),
    app.get(TimeoutInterceptor),
  );
}
