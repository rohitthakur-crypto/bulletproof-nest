export { PrismaModule } from './prisma.module';

export { PrismaService } from './prisma.service';

export { BasePrismaRepository } from './repositories/base.repository';

export { mapPrismaError } from './helpers/prisma-error.mapper';

export type { MappedPrismaError } from './helpers/prisma-error.mapper';

export {
  buildCursorPaginationMeta,
  buildOffsetPaginationMeta,
  toPrismaOffset,
} from './helpers/pagination.helper';

export type {
  OffsetPaginationInput,
  PrismaOffsetArgs,
} from './helpers/pagination.helper';

export { withTransaction } from './helpers/transaction.helper';

export type { ExtendedPrismaClient } from './prisma.extension';

export type {
  TransactionCallback,
  TransactionClient,
  TransactionOptions,
} from './prisma.types';
