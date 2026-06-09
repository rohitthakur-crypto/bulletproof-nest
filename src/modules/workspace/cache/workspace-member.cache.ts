import { Injectable } from '@nestjs/common';
import type { WorkspaceMember } from '@prisma/client';

import { CacheService, CACHE_TTL } from '@/core/cache';

@Injectable()
export class WorkspaceMemberCacheService {
  constructor(private readonly cache: CacheService) {}

  private keys = {
    byId: (id: string) => this.cache.buildKey('workspace-members', 'id', id),
    byWorkspaceAndUser: (workspaceId: string, userId: string) =>
      this.cache.buildKey('workspace-members', 'workspace', workspaceId, 'user', userId),
  };

  rememberById(id: string, loader: () => Promise<WorkspaceMember>): Promise<WorkspaceMember> {
    return this.cache.remember(this.keys.byId(id), CACHE_TTL.FIVE_MIN, loader);
  }

  async getOrSetByWorkspaceAndUser(
    workspaceId: string,
    userId: string,
    loader: () => Promise<WorkspaceMember | null>,
  ): Promise<WorkspaceMember | null> {
    const key = this.keys.byWorkspaceAndUser(workspaceId, userId);
    const cached = await this.cache.get<WorkspaceMember>(key);
    if (cached) return cached;

    const member = await loader();
    if (member) {
      await this.cache.set(key, member, CACHE_TTL.FIVE_MIN);
    }

    return member;
  }

  async invalidateMember(id: string, workspaceId: string, userId: string): Promise<void> {
    await this.cache.delMany([
      this.keys.byId(id),
      this.keys.byWorkspaceAndUser(workspaceId, userId),
    ]);
  }
}
