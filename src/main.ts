import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { AppModule } from './app.module';

import { configureApplication } from '@/bootstrap';
import { AppConfigService } from '@/core/config/services/app-config.service';
import { PrismaService } from '@/infra/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    { bufferLogs: true },
  );

  app.get(PrismaService).enableShutdownHooks(app);

  await configureApplication(app);

  const config = app.get(AppConfigService);

  await app.listen(config.app.port, config.app.host);
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
