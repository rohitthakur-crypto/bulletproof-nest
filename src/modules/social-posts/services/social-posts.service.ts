import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SocialAccountStatus, SocialPlatform } from '@prisma/client';

import { SOCIAL_POSTS_FETCH_LIMIT } from '../constants';
import type { ListSocialPostsResponse, SyncOlderPostsResponse } from '../dto';
import type { SocialPostProvider } from '../interfaces';
import { toSocialPostResponses } from '../mappers';
import { FacebookPostProvider } from '../providers/facebook-post.provider';
import { InstagramPostProvider } from '../providers/instagram-post.provider';
import { SocialPostSyncStateRepository } from '../repositories/social-post-sync-state.repository';
import { SocialPostRepository } from '../repositories/social-post.repository';
import type { ListSocialPostsQuery } from '../validators';

import { toIsoString } from '@/common/utils';
import { EncryptionService } from '@/core/security/encryption/encryption.service';
import {
  buildOffsetPaginationMeta,
  toPrismaOffset,
} from '@/infra/prisma/helpers/pagination.helper';
import { SocialAccountsRepository } from '@/modules/social-accounts/repositories/social-accounts.repository';
import { SocialCredentialsRepository } from '@/modules/social-accounts/repositories/social-credentials.repository';

@Injectable()
export class SocialPostsService {
  constructor(
    private readonly socialPostRepo: SocialPostRepository,
    private readonly syncStateRepo: SocialPostSyncStateRepository,
    private readonly socialAccountRepo: SocialAccountsRepository,
    private readonly socialCredentialsRepo: SocialCredentialsRepository,
    private readonly encryptionService: EncryptionService,
    private readonly facebookPostProvider: FacebookPostProvider,
    private readonly instagramPostProvider: InstagramPostProvider,
  ) {}

  // ─── Public ───────────────────────────────────────────────────────────────────

  async listPosts(
    workspaceId: string,
    socialAccountId: string,
    query: ListSocialPostsQuery,
  ): Promise<ListSocialPostsResponse> {
    const account = await this.requireActiveAccount(workspaceId, socialAccountId);

    const hasPosts = await this.socialPostRepo.hasPostsForAccount(socialAccountId);

    if (!hasPosts) {
      await this.performInitialFetch(account, workspaceId);
    }

    const pagination = toPrismaOffset({ page: query.page, limit: query.limit });

    const [posts, total] = await Promise.all([
      this.socialPostRepo.findManyByAccountId(socialAccountId, workspaceId, pagination),
      this.socialPostRepo.countByAccountId(socialAccountId, workspaceId),
    ]);

    const syncState = await this.syncStateRepo.findByAccountId(socialAccountId);

    return {
      data: toSocialPostResponses(posts),
      pagination: buildOffsetPaginationMeta({ page: query.page, limit: query.limit }, total),
      sync: {
        hasMoreRemote: syncState?.hasMore ?? true,
        lastSyncedAt: toIsoString(syncState?.lastSyncedAt),
      },
    };
  }

  async refreshPosts(
    workspaceId: string,
    socialAccountId: string,
  ): Promise<ListSocialPostsResponse> {
    const account = await this.requireActiveAccount(workspaceId, socialAccountId);
    const { token } = await this.resolveAccountToken(socialAccountId);
    const provider = this.resolveProvider(account.platform);

    const result = await provider.getLatestPosts(
      account.platformAccountId,
      token,
      SOCIAL_POSTS_FETCH_LIMIT,
    );

    await this.socialPostRepo.upsertMany(
      result.posts,
      workspaceId,
      socialAccountId,
      account.platform,
    );

    // Preserve existing cursor — only update the last-synced timestamp on refresh
    await this.syncStateRepo.updateLastSyncedAt(socialAccountId, new Date());

    const pagination = toPrismaOffset({ page: 1, limit: SOCIAL_POSTS_FETCH_LIMIT });

    const [posts, total] = await Promise.all([
      this.socialPostRepo.findManyByAccountId(socialAccountId, workspaceId, pagination),
      this.socialPostRepo.countByAccountId(socialAccountId, workspaceId),
    ]);

    const syncState = await this.syncStateRepo.findByAccountId(socialAccountId);

    return {
      data: toSocialPostResponses(posts),
      pagination: buildOffsetPaginationMeta({ page: 1, limit: SOCIAL_POSTS_FETCH_LIMIT }, total),
      sync: {
        hasMoreRemote: syncState?.hasMore ?? true,
        lastSyncedAt: toIsoString(syncState?.lastSyncedAt),
      },
    };
  }

  async syncOlderPosts(
    workspaceId: string,
    socialAccountId: string,
  ): Promise<SyncOlderPostsResponse> {
    const account = await this.requireActiveAccount(workspaceId, socialAccountId);
    const syncState = await this.syncStateRepo.findByAccountId(socialAccountId);

    if (syncState && !syncState.hasMore) {
      return {
        data: [],
        sync: {
          hasMoreRemote: false,
          lastSyncedAt: toIsoString(syncState.lastSyncedAt),
        },
      };
    }

    const cursor = syncState?.nextCursor ?? null;
    const { token } = await this.resolveAccountToken(socialAccountId);
    const provider = this.resolveProvider(account.platform);

    const result = cursor
      ? await provider.getOlderPosts(
          account.platformAccountId,
          token,
          cursor,
          SOCIAL_POSTS_FETCH_LIMIT,
        )
      : await provider.getLatestPosts(account.platformAccountId, token, SOCIAL_POSTS_FETCH_LIMIT);

    await this.socialPostRepo.upsertMany(
      result.posts,
      workspaceId,
      socialAccountId,
      account.platform,
    );

    await this.syncStateRepo.upsert(socialAccountId, {
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
      lastSyncedAt: new Date(),
    });

    const platformPostIds = result.posts.map((p) => p.platformPostId);
    const syncedPosts = await this.socialPostRepo.findByPlatformPostIds(
      socialAccountId,
      platformPostIds,
    );

    return {
      data: toSocialPostResponses(syncedPosts),
      sync: {
        hasMoreRemote: result.hasMore,
        lastSyncedAt: new Date().toISOString(),
      },
    };
  }

  // ─── Private ──────────────────────────────────────────────────────────────────

  private async performInitialFetch(
    account: { id: string; platformAccountId: string; platform: SocialPlatform },
    workspaceId: string,
  ): Promise<void> {
    const { token } = await this.resolveAccountToken(account.id);
    const provider = this.resolveProvider(account.platform);

    const result = await provider.getLatestPosts(
      account.platformAccountId,
      token,
      SOCIAL_POSTS_FETCH_LIMIT,
    );

    await this.socialPostRepo.upsertMany(result.posts, workspaceId, account.id, account.platform);

    await this.syncStateRepo.upsert(account.id, {
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
      lastSyncedAt: new Date(),
    });
  }

  private async requireActiveAccount(workspaceId: string, socialAccountId: string) {
    const account = await this.socialAccountRepo.findByIdAndWorkspace(socialAccountId, workspaceId);

    if (!account) {
      throw new NotFoundException('Social account not found');
    }

    if (account.status !== SocialAccountStatus.ACTIVE) {
      throw new BadRequestException('Social account is not active');
    }

    return account;
  }

  private async resolveAccountToken(socialAccountId: string): Promise<{ token: string }> {
    const credentials = await this.socialCredentialsRepo.findBySocialAccountId(socialAccountId);

    if (!credentials) {
      throw new NotFoundException('Account credentials not found');
    }

    const token = this.encryptionService.decrypt(credentials.accessToken);

    return { token };
  }

  private resolveProvider(platform: SocialPlatform): SocialPostProvider {
    switch (platform) {
      case SocialPlatform.FACEBOOK:
        return this.facebookPostProvider;
      case SocialPlatform.INSTAGRAM:
        return this.instagramPostProvider;
      default:
        throw new BadRequestException(`Unsupported platform for post sync: ${platform}`);
    }
  }
}
