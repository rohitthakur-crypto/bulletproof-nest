import { Injectable } from '@nestjs/common';

import { FACEBOOK_POST_FIELDS } from '../constants';
import type {
  SocialPostFetchResult,
  SocialPostProvider,
  NormalizedSocialPost,
} from '../interfaces';

import { HttpMethod } from '@/common/enums';
import { AppConfigService } from '@/core/config/services/app-config.service';
import { HttpClientService } from '@/infra/http/http-client.service';
import { META_GRAPH_PAGE_POSTS_PATH } from '@/modules/integrations/constants';
import type { FacebookPost, MetaGraphResponse } from '@/modules/integrations/interfaces';

@Injectable()
export class FacebookPostProvider implements SocialPostProvider {
  constructor(
    private readonly http: HttpClientService,
    private readonly config: AppConfigService,
  ) {}

  async getLatestPosts(
    pageId: string,
    accessToken: string,
    limit: number,
  ): Promise<SocialPostFetchResult> {
    return this.fetchPage(pageId, accessToken, limit, undefined);
  }

  async getOlderPosts(
    pageId: string,
    accessToken: string,
    cursor: string,
    limit: number,
  ): Promise<SocialPostFetchResult> {
    return this.fetchPage(pageId, accessToken, limit, cursor);
  }

  // ─── Private ──────────────────────────────────────────────────────────────────

  private async fetchPage(
    pageId: string,
    accessToken: string,
    limit: number,
    after: string | undefined,
  ): Promise<SocialPostFetchResult> {
    const response = await this.http.request<MetaGraphResponse<FacebookPost>>({
      method: HttpMethod.GET,
      baseURL: this.getGraphBaseUrl(),
      url: META_GRAPH_PAGE_POSTS_PATH(pageId),
      params: {
        fields: FACEBOOK_POST_FIELDS,
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

  private normalizePost(post: FacebookPost): NormalizedSocialPost {
    return {
      platformPostId: post.id,
      caption: post.message ?? post.story,
      mediaType: post.full_picture ? 'image' : undefined,
      mediaUrl: post.full_picture,
      thumbnailUrl: post.full_picture,
      permalink: post.permalink_url,
      publishedAt: post.created_time ? new Date(post.created_time) : undefined,
    };
  }

  private getGraphBaseUrl(): string {
    const { graph } = this.config.meta;
    return `${graph.baseUrl}/${graph.version}`;
  }
}
