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

  async getById(id: string): Promise<User | null> {
    return this.cache.get<User>(this.keys.byId(id));
  }

  async setById(id: string, user: User): Promise<void> {
    await this.cache.set(this.keys.byId(id), user, CACHE_TTL.FIVE_MIN);
  }

  async getByEmail(email: string): Promise<User | null> {
    return this.cache.get<User>(this.keys.byEmail(email));
  }

  async setByEmail(email: string, user: User): Promise<void> {
    await this.cache.set(this.keys.byEmail(email), user, CACHE_TTL.FIVE_MIN);
  }

  async invalidateUser(id: string, email: string): Promise<void> {
    await this.cache.delMany([this.keys.byId(id), this.keys.byEmail(email)]);
  }

  async invalidateById(id: string): Promise<void> {
    await this.cache.invalidateByPattern(this.cache.buildKey('users', 'id', id, '*'));
  }
}
