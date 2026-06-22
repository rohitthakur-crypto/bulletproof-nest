import { Injectable } from '@nestjs/common';

import type { FacebookPost, InstagramPost, MetaOAuthSession } from '../interfaces';

import { CACHE_TTL, type CacheTtl } from '@/core/cache/cache.constants';
import { CacheService } from '@/core/cache/cache.service';

@Injectable()
export class MetaCacheService {
  constructor(private readonly cache: CacheService) {}

  private keys = {
    oAuthSession: (sessionId: string, workspaceId: string) =>
      this.cache.buildKey('meta', 'oauth', sessionId, workspaceId),

    facebookPosts: (pageId: string) => this.cache.buildKey('meta', 'facebook', 'posts', pageId),

    instagramPosts: (instagramBusinessId: string) =>
      this.cache.buildKey('meta', 'instagram', 'posts', instagramBusinessId),
  };

  public async getOAuthSession(
    sessionId: string,
    workspaceId: string,
  ): Promise<MetaOAuthSession | null> {
    return this.cache.get(this.keys.oAuthSession(sessionId, workspaceId));
  }

  public async setOAuthSession(
    sessionId: string,
    workspaceId: string,
    payload: MetaOAuthSession,
  ): Promise<void> {
    return this.cache.set(
      this.keys.oAuthSession(sessionId, workspaceId),
      payload,
      CACHE_TTL.FIFTEEN_MIN,
    );
  }

  public async deleteOAuthSession(sessionId: string, workspaceId: string): Promise<void> {
    return this.cache.del(this.keys.oAuthSession(sessionId, workspaceId));
  }

  public async getOrSetFacebookPosts(
    pageId: string,
    loader: () => Promise<FacebookPost[]>,
    ttl: CacheTtl = CACHE_TTL.FIFTEEN_MIN,
  ): Promise<FacebookPost[]> {
    return this.cache.remember(this.keys.facebookPosts(pageId), ttl, loader);
  }

  public async getOrSetInstagramPosts(
    instagramBusinessId: string,
    loader: () => Promise<InstagramPost[]>,
    ttl: CacheTtl = CACHE_TTL.FIFTEEN_MIN,
  ): Promise<InstagramPost[]> {
    return this.cache.remember(this.keys.instagramPosts(instagramBusinessId), ttl, loader);
  }

  public async deleteFacebookPosts(pageId: string): Promise<void> {
    return this.cache.del(this.keys.facebookPosts(pageId));
  }

  public async deleteInstagramPosts(instagramBusinessId: string): Promise<void> {
    return this.cache.del(this.keys.instagramPosts(instagramBusinessId));
  }
}
