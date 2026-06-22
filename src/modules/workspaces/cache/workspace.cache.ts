import { Injectable } from '@nestjs/common';
import type { Workspace } from '@prisma/client';

import { CACHE_TTL } from '@/core/cache/cache.constants';
import { CacheService } from '@/core/cache/cache.service';

@Injectable()
export class WorkspaceCacheService {
  constructor(private readonly cache: CacheService) {}

  private keys = {
    byId: (id: string) => this.cache.buildKey('workspaces', 'id', id),
    bySlug: (slug: string) => this.cache.buildKey('workspaces', 'slug', slug),
  };

  getOrSetById(id: string, loader: () => Promise<Workspace>): Promise<Workspace> {
    return this.cache.remember(this.keys.byId(id), CACHE_TTL.FIVE_MIN, loader);
  }

  async getOrSetBySlug(
    slug: string,
    loader: () => Promise<Workspace | null>,
  ): Promise<Workspace | null> {
    const cached = await this.cache.get<Workspace>(this.keys.bySlug(slug));
    if (cached) return cached;

    const workspace = await loader();
    if (workspace) {
      await this.cache.set(this.keys.bySlug(slug), workspace, CACHE_TTL.FIVE_MIN);
    }

    return workspace;
  }

  async invalidateWorkspace(id: string, slug: string): Promise<void> {
    await this.cache.delMany([this.keys.byId(id), this.keys.bySlug(slug)]);
  }
}
