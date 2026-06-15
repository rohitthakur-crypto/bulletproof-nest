import { Injectable } from '@nestjs/common';
import type { Prisma, SocialAccount, SocialPlatform } from '@prisma/client';

import type { ListSocialAccountsFilters } from '../validators';

import { BasePrismaRepository, PrismaService } from '@/infra/prisma';
import type { PrismaOffsetArgs } from '@/infra/prisma';

@Injectable()
export class SocialAccountsRepository extends BasePrismaRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<SocialAccount | null> {
    return this.db.socialAccount.findUnique({ where: { id } });
  }

  async findByIdAndWorkspace(id: string, workspaceId: string): Promise<SocialAccount | null> {
    return this.db.socialAccount.findFirst({
      where: { id, workspaceId },
    });
  }

  async findByWorkspacePlatformAccountId(
    workspaceId: string,
    platform: SocialPlatform,
    platformAccountId: string,
  ): Promise<SocialAccount | null> {
    return this.db.socialAccount.findUnique({
      where: {
        workspaceId_platform_platformAccountId: {
          workspaceId,
          platform,
          platformAccountId,
        },
      },
    });
  }

  async findManyByWorkspace(
    filters: ListSocialAccountsFilters,
    pagination: PrismaOffsetArgs,
  ): Promise<SocialAccount[]> {
    return this.db.socialAccount.findMany({
      where: this.buildListWhere(filters),
      orderBy: [{ createdAt: 'desc' }],
      skip: pagination.skip,
      take: pagination.take,
    });
  }

  async countByWorkspace(filters: ListSocialAccountsFilters): Promise<number> {
    return this.db.socialAccount.count({
      where: this.buildListWhere(filters),
    });
  }

  async create(data: Prisma.SocialAccountCreateInput): Promise<SocialAccount> {
    return this.db.socialAccount.create({ data });
  }

  async update(id: string, data: Prisma.SocialAccountUpdateInput): Promise<SocialAccount> {
    return this.db.socialAccount.update({ where: { id }, data });
  }

  async delete(id: string): Promise<SocialAccount> {
    return this.db.socialAccount.delete({ where: { id } });
  }

  private buildListWhere(filters: ListSocialAccountsFilters): Prisma.SocialAccountWhereInput {
    const search = filters.search?.trim();

    return {
      workspaceId: filters.workspaceId,
      ...(filters.platform && { platform: filters.platform }),
      ...(filters.status && { status: filters.status }),
      ...(search && {
        OR: [
          { accountName: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };
  }
}
