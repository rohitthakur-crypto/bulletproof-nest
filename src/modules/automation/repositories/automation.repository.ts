import { Injectable } from '@nestjs/common';
import type { Automation, AutomationTriggerType, Prisma } from '@prisma/client';

import type { ListAutomationsQuery } from '../validators';

import type { PrismaOffsetArgs } from '@/infra/prisma/helpers/pagination.helper';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { BasePrismaRepository } from '@/infra/prisma/repositories/base.repository';

@Injectable()
export class AutomationRepository extends BasePrismaRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<Automation | null> {
    return this.db.automation.findUnique({ where: { id } });
  }

  async findByIdAndWorkspace(id: string, workspaceId: string): Promise<Automation | null> {
    return this.db.automation.findFirst({ where: { id, workspaceId } });
  }

  async findManyByWorkspace(
    workspaceId: string,
    query: ListAutomationsQuery,
    pagination: PrismaOffsetArgs,
  ): Promise<Automation[]> {
    return this.db.automation.findMany({
      where: this.buildListWhere(workspaceId, query),
      orderBy: [{ createdAt: 'desc' }],
      skip: pagination.skip,
      take: pagination.take,
    });
  }

  async countByWorkspace(workspaceId: string, query: ListAutomationsQuery): Promise<number> {
    return this.db.automation.count({
      where: this.buildListWhere(workspaceId, query),
    });
  }

  async findActiveByTriggerAndAccount(
    socialAccountId: string,
    triggerType: AutomationTriggerType,
  ): Promise<Automation[]> {
    return this.db.automation.findMany({
      where: { socialAccountId, triggerType, status: 'ACTIVE' },
    });
  }

  async create(data: Prisma.AutomationCreateInput): Promise<Automation> {
    return this.db.automation.create({ data });
  }

  async update(id: string, data: Prisma.AutomationUpdateInput): Promise<Automation> {
    return this.db.automation.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Automation> {
    return this.db.automation.delete({ where: { id } });
  }

  // ─── Private ──────────────────────────────────────────────────────────────────

  private buildListWhere(
    workspaceId: string,
    query: ListAutomationsQuery,
  ): Prisma.AutomationWhereInput {
    const search = query.search?.trim();

    return {
      workspaceId,
      ...(query.status && { status: query.status }),
      ...(query.triggerType && { triggerType: query.triggerType }),
      ...(query.socialAccountId && { socialAccountId: query.socialAccountId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };
  }
}
