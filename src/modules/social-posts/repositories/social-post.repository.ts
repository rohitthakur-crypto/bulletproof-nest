import { Injectable } from '@nestjs/common';
import type { SocialPlatform, SocialPost } from '@prisma/client';

import type { NormalizedSocialPost } from '../interfaces';

import type { PrismaOffsetArgs } from '@/infra/prisma/helpers/pagination.helper';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { BasePrismaRepository } from '@/infra/prisma/repositories/base.repository';

@Injectable()
export class SocialPostRepository extends BasePrismaRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByIdAndWorkspace(id: string, workspaceId: string): Promise<SocialPost | null> {
    return this.db.socialPost.findFirst({ where: { id, workspaceId } });
  }

  async findManyByAccountId(
    socialAccountId: string,
    workspaceId: string,
    pagination: PrismaOffsetArgs,
  ): Promise<SocialPost[]> {
    return this.db.socialPost.findMany({
      where: { socialAccountId, workspaceId, isDeleted: false },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      skip: pagination.skip,
      take: pagination.take,
    });
  }

  async countByAccountId(socialAccountId: string, workspaceId: string): Promise<number> {
    return this.db.socialPost.count({
      where: { socialAccountId, workspaceId, isDeleted: false },
    });
  }

  async hasPostsForAccount(socialAccountId: string): Promise<boolean> {
    const post = await this.db.socialPost.findFirst({
      where: { socialAccountId, isDeleted: false },
      select: { id: true },
    });

    return post !== null;
  }

  async findByPlatformPostIds(
    socialAccountId: string,
    platformPostIds: string[],
  ): Promise<SocialPost[]> {
    return this.db.socialPost.findMany({
      where: {
        socialAccountId,
        platformPostId: { in: platformPostIds },
        isDeleted: false,
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async upsertMany(
    posts: NormalizedSocialPost[],
    workspaceId: string,
    socialAccountId: string,
    platform: SocialPlatform,
  ): Promise<void> {
    if (posts.length === 0) return;

    const now = new Date();

    await this.withTransaction(async (tx) => {
      for (const post of posts) {
        await tx.socialPost.upsert({
          where: {
            socialAccountId_platformPostId: {
              socialAccountId,
              platformPostId: post.platformPostId,
            },
          },
          create: {
            workspaceId,
            socialAccountId,
            platform,
            platformPostId: post.platformPostId,
            caption: post.caption ?? null,
            mediaType: post.mediaType ?? null,
            mediaUrl: post.mediaUrl ?? null,
            thumbnailUrl: post.thumbnailUrl ?? null,
            permalink: post.permalink ?? null,
            publishedAt: post.publishedAt ?? null,
            lastSeenAt: now,
            isDeleted: false,
          },
          update: {
            caption: post.caption ?? null,
            mediaType: post.mediaType ?? null,
            mediaUrl: post.mediaUrl ?? null,
            thumbnailUrl: post.thumbnailUrl ?? null,
            permalink: post.permalink ?? null,
            publishedAt: post.publishedAt ?? null,
            lastSeenAt: now,
            isDeleted: false,
            deletedAt: null,
          },
        });
      }
    });
  }
}
