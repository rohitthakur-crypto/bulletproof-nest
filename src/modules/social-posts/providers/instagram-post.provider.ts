import { Injectable } from '@nestjs/common';

import { IG_MEDIA_TYPE_MAP, INSTAGRAM_POST_FIELDS } from '../constants';
import type {
  SocialPostFetchResult,
  SocialPostProvider,
  NormalizedSocialPost,
} from '../interfaces';

import { HttpMethod } from '@/common/enums';
import { AppConfigService } from '@/core/config/services/app-config.service';
import { HttpClientService } from '@/infra/http/http-client.service';
import { META_GRAPH_INSTAGRAM_POSTS_PATH } from '@/modules/integrations/constants';
import type { InstagramPost, MetaGraphResponse } from '@/modules/integrations/interfaces';

@Injectable()
export class InstagramPostProvider implements SocialPostProvider {
  constructor(
    private readonly http: HttpClientService,
    private readonly config: AppConfigService,
  ) {}

  async getLatestPosts(
    instagramBusinessId: string,
    accessToken: string,
    limit: number,
  ): Promise<SocialPostFetchResult> {
    return this.fetchPage(instagramBusinessId, accessToken, limit, undefined);
  }

  async getOlderPosts(
    instagramBusinessId: string,
    accessToken: string,
    cursor: string,
    limit: number,
  ): Promise<SocialPostFetchResult> {
    return this.fetchPage(instagramBusinessId, accessToken, limit, cursor);
  }

  // ─── Private ──────────────────────────────────────────────────────────────────

  private async fetchPage(
    instagramBusinessId: string,
    accessToken: string,
    limit: number,
    after: string | undefined,
  ): Promise<SocialPostFetchResult> {
    const response = await this.http.request<MetaGraphResponse<InstagramPost>>({
      method: HttpMethod.GET,
      baseURL: this.getGraphBaseUrl(),
      url: META_GRAPH_INSTAGRAM_POSTS_PATH(instagramBusinessId),
      params: {
        fields: INSTAGRAM_POST_FIELDS,
        limit,
        ...(after && { after }),
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const nextCursor = response.paging?.cursors?.after ?? null;
    const hasMore = !!response.paging?.next;

    return {
      posts: response.data.map((post) => this.normalizePost(post)),
      nextCursor,
      hasMore,
    };
  }

  private normalizePost(post: InstagramPost): NormalizedSocialPost {
    return {
      platformPostId: post.id,
      caption: post.caption,
      mediaType: IG_MEDIA_TYPE_MAP[post.media_type] ?? 'unknown',
      mediaUrl: post.media_url,
      thumbnailUrl: post.thumbnail_url ?? post.media_url,
      permalink: post.permalink,
      publishedAt: post.timestamp ? new Date(post.timestamp) : undefined,
    };
  }

  private getGraphBaseUrl(): string {
    const { graph } = this.config.meta;
    return `${graph.baseUrl}/${graph.version}`;
  }
}
