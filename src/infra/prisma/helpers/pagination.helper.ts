import type {
  CursorPaginationMeta,
  OffsetPaginationMeta,
} from '@/common/types';

export interface OffsetPaginationInput {
  page: number;
  limit: number;
}

export interface PrismaOffsetArgs {
  skip: number;
  take: number;
}

export function toPrismaOffset(input: OffsetPaginationInput): PrismaOffsetArgs {
  const page = Math.max(1, input.page);
  const limit = Math.max(1, input.limit);

  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function buildOffsetPaginationMeta(
  input: OffsetPaginationInput,
  total: number,
): OffsetPaginationMeta {
  const page = Math.max(1, input.page);
  const limit = Math.max(1, input.limit);

  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

export function buildCursorPaginationMeta(input: {
  limit: number;
  hasMore: boolean;
  nextCursor: string | null;
}): CursorPaginationMeta {
  return {
    limit: Math.max(1, input.limit),
    hasMore: input.hasMore,
    nextCursor: input.nextCursor,
  };
}
