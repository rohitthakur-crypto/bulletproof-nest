import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import { withTransaction } from './helpers/transaction.helper';
import { createExtendedPrismaClient, type ExtendedPrismaClient } from './prisma.extension';
import type { TransactionCallback, TransactionOptions } from './prisma.types';

import { AppConfigService } from '@/core/config/services/app-config.service';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  readonly client: ExtendedPrismaClient;

  constructor(private readonly config: AppConfigService) {
    this.client = createExtendedPrismaClient(config);
  }

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
    this.logger.log('Database connection established');
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
    this.logger.log('Database connection closed');
  }

  enableShutdownHooks(app: INestApplication): void {
    app.enableShutdownHooks();
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  withTransaction<T>(fn: TransactionCallback<T>, options?: TransactionOptions): Promise<T> {
    return withTransaction(this.client, fn, options);
  }
}
