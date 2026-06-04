import type { CacheTtl } from './cache.constants';

export interface CacheSetManyEntry {
  key: string;
  value: unknown;
  ttl?: CacheTtl;
}
