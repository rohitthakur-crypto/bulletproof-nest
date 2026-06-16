import { Injectable } from '@nestjs/common';

import { CACHE_TTL, type CacheTtl } from './cache.constants';
import type { CacheSetManyEntry } from './cache.types';

import { AppConfigService } from '@/core/config';
import { RedisService } from '@/infra/redis';

const LOCK_TTL_SECONDS = 10;
const LOCK_RETRY_DELAY_MS = 100;
const SCAN_BATCH_SIZE = 100;

@Injectable()
export class CacheService {
  private readonly keyPrefix: string;

  constructor(
    private readonly redisService: RedisService,
    private readonly appConfig: AppConfigService,
  ) {
    this.keyPrefix = `${appConfig.app.name}:${appConfig.app.env}`;
  }

  buildKey(...parts: Array<string | number>): string {
    return [this.keyPrefix, ...parts].join(':');
  }

  private get client() {
    return this.redisService.getClient();
  }

  private safeDeserialize<T>(raw: string | null): T | null {
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    return this.safeDeserialize<T>(raw);
  }

  async set(key: string, value: unknown, ttl: CacheTtl = CACHE_TTL.FIVE_MIN): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await this.client.del(...keys);
  }

  async getMany<T>(keys: string[]): Promise<Array<T | null>> {
    if (keys.length === 0) return [];
    const raws = await this.client.mget(...keys);
    return raws.map((raw) => this.safeDeserialize<T>(raw));
  }

  async setMany(entries: CacheSetManyEntry[]): Promise<void> {
    if (entries.length === 0) return;
    const pipeline = this.client.pipeline();
    for (const { key, value, ttl = CACHE_TTL.FIVE_MIN } of entries) {
      pipeline.set(key, JSON.stringify(value), 'EX', ttl);
    }
    await pipeline.exec();
  }

  async remember<T>(key: string, ttl: CacheTtl, fn: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const lockKey = `${key}:__lock__`;
    const acquired = await this.client.set(lockKey, '1', 'EX', LOCK_TTL_SECONDS, 'NX');

    if (!acquired) {
      await new Promise<void>((resolve) => setTimeout(resolve, LOCK_RETRY_DELAY_MS));
      return (await this.get<T>(key)) ?? fn();
    }

    try {
      const fresh = await fn();
      await this.set(key, fresh, ttl);
      return fresh;
    } finally {
      await this.client.del(lockKey);
    }
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async expire(key: string, ttl: CacheTtl): Promise<void> {
    await this.client.expire(key, ttl);
  }

  async increment(key: string, by = 1): Promise<number> {
    return this.client.incrby(key, by);
  }

  async decrement(key: string, by = 1): Promise<number> {
    return this.client.decrby(key, by);
  }

  async setNx(key: string, value: unknown, ttl: CacheTtl): Promise<boolean> {
    const result = await this.client.set(key, JSON.stringify(value), 'EX', ttl, 'NX');
    return result === 'OK';
  }

  async invalidateByPattern(pattern: string): Promise<number> {
    let cursor = '0';
    let deleted = 0;

    do {
      const [next, keys] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        SCAN_BATCH_SIZE,
      );
      cursor = next;

      if (keys.length > 0) {
        await this.client.del(...keys);
        deleted += keys.length;
      }
    } while (cursor !== '0');

    return deleted;
  }
}
