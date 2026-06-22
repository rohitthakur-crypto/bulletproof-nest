import { Injectable } from '@nestjs/common';
import type { SocialPostSyncState } from '@prisma/client';

import { PrismaService } from '@/infra/prisma/prisma.service';
import { BasePrismaRepository } from '@/infra/prisma/repositories/base.repository';

export interface UpsertSyncStateInput {
  nextCursor?: string | null;
  hasMore?: boolean;
  lastSyncedAt?: Date | null;
}

@Injectable()
export class SocialPostSyncStateRepository extends BasePrismaRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByAccountId(socialAccountId: string): Promise<SocialPostSyncState | null> {
    return this.db.socialPostSyncState.findUnique({ where: { socialAccountId } });
  }

  async upsert(socialAccountId: string, data: UpsertSyncStateInput): Promise<SocialPostSyncState> {
    return this.db.socialPostSyncState.upsert({
      where: { socialAccountId },
      create: {
        socialAccount: { connect: { id: socialAccountId } },
        nextCursor: data.nextCursor ?? null,
        hasMore: data.hasMore ?? true,
        lastSyncedAt: data.lastSyncedAt ?? null,
      },
      update: {
        ...(data.nextCursor !== undefined && { nextCursor: data.nextCursor }),
        ...(data.hasMore !== undefined && { hasMore: data.hasMore }),
        ...(data.lastSyncedAt !== undefined && { lastSyncedAt: data.lastSyncedAt }),
      },
    });
  }

  async updateLastSyncedAt(socialAccountId: string, lastSyncedAt: Date): Promise<void> {
    await this.db.socialPostSyncState.upsert({
      where: { socialAccountId },
      create: {
        socialAccount: { connect: { id: socialAccountId } },
        lastSyncedAt,
        hasMore: true,
        nextCursor: null,
      },
      update: { lastSyncedAt },
    });
  }
}
