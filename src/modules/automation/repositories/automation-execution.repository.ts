import { Injectable } from '@nestjs/common';
import type { AutomationExecution, AutomationExecutionStatus, Prisma } from '@prisma/client';

import type { PrismaOffsetArgs } from '@/infra/prisma/helpers/pagination.helper';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { BasePrismaRepository } from '@/infra/prisma/repositories/base.repository';

@Injectable()
export class AutomationExecutionRepository extends BasePrismaRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<AutomationExecution | null> {
    return this.db.automationExecution.findUnique({ where: { id } });
  }

  async findByIdAndAutomation(
    id: string,
    automationId: string,
  ): Promise<AutomationExecution | null> {
    return this.db.automationExecution.findFirst({ where: { id, automationId } });
  }

  async findManyByAutomation(
    automationId: string,
    statusFilter: AutomationExecutionStatus | undefined,
    pagination: PrismaOffsetArgs,
  ): Promise<AutomationExecution[]> {
    return this.db.automationExecution.findMany({
      where: {
        automationId,
        ...(statusFilter && { status: statusFilter }),
      },
      orderBy: [{ executedAt: 'desc' }],
      skip: pagination.skip,
      take: pagination.take,
    });
  }

  async countByAutomation(
    automationId: string,
    statusFilter: AutomationExecutionStatus | undefined,
  ): Promise<number> {
    return this.db.automationExecution.count({
      where: {
        automationId,
        ...(statusFilter && { status: statusFilter }),
      },
    });
  }

  async create(data: Prisma.AutomationExecutionCreateInput): Promise<AutomationExecution> {
    return this.db.automationExecution.create({ data });
  }

  async update(
    id: string,
    data: Prisma.AutomationExecutionUpdateInput,
  ): Promise<AutomationExecution> {
    return this.db.automationExecution.update({ where: { id }, data });
  }
}
