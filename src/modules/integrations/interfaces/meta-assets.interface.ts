export interface MetaInstagramBusinessAccount {
  id: string;
  username?: string;
  profile_picture_url?: string;
}

export interface MetaPicture {
  data: {
    url: string;
    width: number;
    height: number;
    is_silhouette: boolean;
  };
}

export interface MetaAsset {
  id: string;
  name: string;
  access_token?: string;
  picture?: MetaPicture;
  instagram_business_account?: MetaInstagramBusinessAccount | null;
}

export interface MetaAssetsResponse {
  data: MetaAsset[];
  paging?: { before: string; after: string };
}
