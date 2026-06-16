import { Injectable } from '@nestjs/common';

import type { MetaOAuthSession } from '../interfaces';

import { CACHE_TTL, CacheService } from '@/core/cache';

@Injectable()
export class MetaOAuthCacheService {
  constructor(private readonly cache: CacheService) {}

  private keys = {
    oAuthSession: (sessionId: string, workspaceId: string) =>
      this.cache.buildKey('meta', 'oauth', sessionId, workspaceId),
  };

  async getOAuthSession(sessionId: string, workspaceId: string): Promise<MetaOAuthSession | null> {
    return this.cache.get(this.keys.oAuthSession(sessionId, workspaceId));
  }

  async setOAuthSession(
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

  async deleteOAuthSession(sessionId: string, workspaceId: string): Promise<void> {
    return this.cache.del(this.keys.oAuthSession(sessionId, workspaceId));
  }
}
