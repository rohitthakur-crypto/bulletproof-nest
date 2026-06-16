import { Readable } from 'stream';

import compress from '@fastify/compress';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { FastifyRequest } from 'fastify';

import { CORS_ALLOWED_METHODS } from '@/common/enums';
import type { AppConfigService } from '@/core/config';

export async function setupFastify(
  app: NestFastifyApplication,
  config: AppConfigService,
): Promise<void> {
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `'unsafe-inline'`],
      },
    },
  });

  await app.register(cors, {
    origin: [...config.app.corsOrigins],
    credentials: true,
    methods: CORS_ALLOWED_METHODS,
  });

  await app.register(compress);

  await app.register(cookie);

  const fastify = app.getHttpAdapter().getInstance();

  fastify.addHook('preParsing', async (request, _reply, payload) => {
    const chunks: Buffer[] = [];

    for await (const chunk of payload as AsyncIterable<Buffer>) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const rawBody = Buffer.concat(chunks);

    (request as FastifyRequest & { rawBody: Buffer }).rawBody = rawBody;

    const clone = new Readable();
    clone.push(rawBody);
    clone.push(null);

    return clone;
  });
}
