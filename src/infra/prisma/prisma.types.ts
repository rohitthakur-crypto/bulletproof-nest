import type { ExtendedPrismaClient } from './prisma.extension';

export type TransactionClient = Omit<
  ExtendedPrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>;

export type TransactionCallback<T> = (tx: TransactionClient) => Promise<T>;

export interface TransactionOptions {
  maxWait?: number;
  timeout?: number;
  isolationLevel?:
    | 'ReadUncommitted'
    | 'ReadCommitted'
    | 'RepeatableRead'
    | 'Serializable';
}
