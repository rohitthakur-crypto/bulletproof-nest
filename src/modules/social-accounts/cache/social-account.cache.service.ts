import { Injectable } from '@nestjs/common';

import { MetaOAuthSession } from '../interfaces';

import { CACHE_TTL, CacheService } from '@/core/cache';

@Injectable()
export class SocialAccountCacheService {
  constructor(private readonly cache: CacheService) {}

  private keys = {
    metaOAuthSession: (sessionId: string) =>
      this.cache.buildKey('social-account', 'oauth', sessionId),
  };

  async getMetaOAuthSession(sessionId: string): Promise<MetaOAuthSession | null> {
    return this.cache.get(this.keys.metaOAuthSession(sessionId));
  }
  async setMetaOAuthSession(sessionId: string, payload: MetaOAuthSession): Promise<void> {
    return this.cache.set(this.keys.metaOAuthSession(sessionId), payload, CACHE_TTL.FIFTEEN_MIN);
  }
}
