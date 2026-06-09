import { Injectable } from '@nestjs/common';
import { SessionStatus, type UserSession } from '@prisma/client';

import { CacheService, CACHE_TTL } from '@/core/cache';

const SESSION_CACHE_SCOPE = 'user' as const;
const SESSION_TTL = CACHE_TTL.MINUTE;

@Injectable()
export class UserSessionCacheService {
  constructor(private readonly cache: CacheService) {}

  private key = (sessionId: string) =>
    this.cache.buildKey(SESSION_CACHE_SCOPE, 'sessions', 'id', sessionId);

  async getOrSetById(
    sessionId: string,
    loader: () => Promise<UserSession | null>,
  ): Promise<UserSession | null> {
    const cached = await this.cache.get<UserSession>(this.key(sessionId));
    if (cached) return cached;

    const session = await loader();
    if (session?.status === SessionStatus.ACTIVE) {
      await this.cache.set(this.key(sessionId), session, SESSION_TTL);
    }

    return session;
  }

  invalidateById(sessionId: string): Promise<void> {
    return this.cache.del(this.key(sessionId));
  }
}
