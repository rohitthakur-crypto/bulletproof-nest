import { INestApplication } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';

export function setupValidation(app: INestApplication): void {
  const ZodValidationPipe = createZodValidationPipe({
    strictSchemaDeclaration: true,
  });

  app.useGlobalPipes(new ZodValidationPipe());
}
