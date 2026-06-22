export interface MetaGraphPaging {
  cursors?: {
    before: string;
    after: string;
  };
  next?: string;
  previous?: string;
}

export interface MetaGraphResponse<T> {
  data: T[];
  paging?: MetaGraphPaging;
}
