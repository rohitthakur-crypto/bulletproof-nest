import { withTransaction } from '../helpers/transaction.helper';
import { PrismaService } from '../prisma.service';
import type { TransactionCallback, TransactionOptions } from '../prisma.types';

export abstract class BasePrismaRepository {
  constructor(protected readonly prisma: PrismaService) {}

  protected get db() {
    return this.prisma.client;
  }

  protected withTransaction<T>(
    fn: TransactionCallback<T>,
    options?: TransactionOptions,
  ): Promise<T> {
    return withTransaction(this.prisma.client, fn, options);
  }
}
