export interface OffsetPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CursorPagination {
  limit: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: OffsetPagination;
}

export interface CursorPaginatedResult<T> {
  items: T[];
  pagination: CursorPagination;
}
