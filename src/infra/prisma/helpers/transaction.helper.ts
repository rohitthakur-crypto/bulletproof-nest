import type { ExtendedPrismaClient } from '../prisma.extension';
import type { TransactionCallback, TransactionOptions } from '../prisma.types';

export function withTransaction<T>(
  client: ExtendedPrismaClient,
  fn: TransactionCallback<T>,
  options?: TransactionOptions,
): Promise<T> {
  return client.$transaction(fn, options);
}
