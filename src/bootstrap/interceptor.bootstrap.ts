import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ZodSerializerInterceptor } from 'nestjs-zod';

import { ResponseInterceptor, TimeoutInterceptor } from '@/common/interceptors';
import { LoggingInterceptor } from '@/core/logger';

/**
 * Interceptor registration order (first → last):
 * 1. ResponseInterceptor      — outermost; applies { data, meta? } envelope last on the way out
 * 2. LoggingInterceptor       — handler-level structured logs
 * 3. ZodSerializerInterceptor — validates and serializes handler output via Zod DTOs
 * 4. TimeoutInterceptor       — innermost; aborts slow handlers with 408 Request Timeout
 */
export function setupInterceptors(app: INestApplication): void {
  app.useGlobalInterceptors(
    new ResponseInterceptor(app.get(Reflector)),
    app.get(LoggingInterceptor),
    new ZodSerializerInterceptor(app.get(Reflector)),
    app.get(TimeoutInterceptor),
  );
}
