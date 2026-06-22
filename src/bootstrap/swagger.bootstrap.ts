import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

import { SWAGGER_TAG_DESCRIPTIONS, SWAGGER_TAG_ORDER } from '@/common/constants';

function buildSwaggerConfig(): ReturnType<DocumentBuilder['build']> {
  const builder = new DocumentBuilder()
    .setTitle('NSL Many Chat Aap API')
    .setDescription('NSL Many Chat API Docs')
    .setVersion('1.0')
    .addBearerAuth();

  for (const tag of SWAGGER_TAG_ORDER) {
    builder.addTag(tag, SWAGGER_TAG_DESCRIPTIONS[tag]);
  }

  return builder.build();
}

function orderSwaggerTags(document: ReturnType<typeof SwaggerModule.createDocument>): void {
  document.tags = SWAGGER_TAG_ORDER.map((name) => ({
    name,
    description: SWAGGER_TAG_DESCRIPTIONS[name],
  }));
}

export function setupSwagger(app: INestApplication): void {
  const config = buildSwaggerConfig();
  const document = cleanupOpenApiDoc(SwaggerModule.createDocument(app, config));

  orderSwaggerTags(document);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      operationsSorter: 'alpha',
    },
  });
}
