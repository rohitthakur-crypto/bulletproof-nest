import { Prisma, PrismaClient } from '@prisma/client';

import { Environment } from '@/common/enums';
import type { AppConfigService } from '@/core/config';

export function buildPrismaClientOptions(config: AppConfigService): Prisma.PrismaClientOptions {
  const isProduction = config.app.env === Environment.PRODUCTION;

  return {
    datasources: {
      db: { url: config.database.url },
    },
    log: isProduction ? ['error'] : ['warn', 'error'],
  };
}

export function createExtendedPrismaClient(config: AppConfigService) {
  const client = new PrismaClient(buildPrismaClientOptions(config));

  return client.$extends({ name: 'app' });
}

export type ExtendedPrismaClient = ReturnType<typeof createExtendedPrismaClient>;
