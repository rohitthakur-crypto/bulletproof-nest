export interface MetaGraphPage {
  id: string;
  name: string;
  access_token: string;

  picture?: {
    data: {
      url: string;
      width: number;
      height: number;
      is_silhouette: boolean;
    };
  };
}

export interface MetaPaging {
  cursors: {
    before: string;
    after: string;
  };
}
export interface MetaGraphPagesResponse {
  data: MetaGraphPage[];
  paging?: MetaPaging;
}
