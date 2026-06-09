import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';

import { CacheService, CACHE_TTL } from '@/core/cache';

@Injectable()
export class UsersCacheService {
  constructor(private readonly cache: CacheService) {}

  private keys = {
    byId: (id: string) => this.cache.buildKey('users', 'id', id),
    byEmail: (email: string) => this.cache.buildKey('users', 'email', email),
  };

  /** Cache-aside with stampede protection — use when the loader always returns a value. */
  rememberById(id: string, loader: () => Promise<User>): Promise<User> {
    return this.cache.remember(this.keys.byId(id), CACHE_TTL.FIVE_MIN, loader);
  }

  /** Cache-aside without caching null — use when the loader may return null. */
  async getOrSetByEmail(email: string, loader: () => Promise<User | null>): Promise<User | null> {
    const cached = await this.cache.get<User>(this.keys.byEmail(email));
    if (cached) return cached;

    const user = await loader();
    if (user) {
      await this.cache.set(this.keys.byEmail(email), user, CACHE_TTL.FIVE_MIN);
    }

    return user;
  }

  async invalidateUser(id: string, email: string): Promise<void> {
    await this.cache.delMany([this.keys.byId(id), this.keys.byEmail(email)]);
  }

  async invalidateById(id: string): Promise<void> {
    await this.cache.invalidateByPattern(this.cache.buildKey('users', 'id', id, '*'));
  }
}
