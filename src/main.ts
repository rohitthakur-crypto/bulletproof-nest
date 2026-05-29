import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module';

import { configureApplication } from '@/bootstrap';
import { AppConfigService } from '@/config';
import { PrismaService } from '@/infra/prisma';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    { bufferLogs: true },
  );

  app.get(PrismaService).enableShutdownHooks(app);

  await configureApplication(app);

  const configService = app.get(AppConfigService);

  await app.listen(configService.app.port, configService.app.host);
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
