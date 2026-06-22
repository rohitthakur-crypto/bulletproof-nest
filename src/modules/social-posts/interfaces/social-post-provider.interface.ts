export interface NormalizedSocialPost {
  platformPostId: string;
  caption?: string;
  mediaType?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  permalink?: string;
  publishedAt?: Date;
}

export interface SocialPostFetchResult {
  posts: NormalizedSocialPost[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface SocialPostProvider {
  getLatestPosts(
    accountId: string,
    accessToken: string,
    limit: number,
  ): Promise<SocialPostFetchResult>;
  getOlderPosts(
    accountId: string,
    accessToken: string,
    cursor: string,
    limit: number,
  ): Promise<SocialPostFetchResult>;
}
