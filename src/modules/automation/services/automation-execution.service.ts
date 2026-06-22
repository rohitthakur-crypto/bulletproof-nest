import { Injectable, NotFoundException } from '@nestjs/common';
import type { AutomationExecution } from '@prisma/client';
import { Prisma } from '@prisma/client';

import { AUTOMATION_ERRORS } from '../constants';
import type { AutomationExecutionResponse, PaginatedExecutionsResponse } from '../dto/responses';
import type { TriggerPayload } from '../interfaces';
import { toExecutionResponse, toExecutionResponses } from '../mappers';
import { AutomationExecutionRepository } from '../repositories/automation-execution.repository';
import { AutomationRepository } from '../repositories/automation.repository';
import type { ListExecutionsQuery } from '../validators';

import {
  buildOffsetPaginationMeta,
  toPrismaOffset,
} from '@/infra/prisma/helpers/pagination.helper';

@Injectable()
export class AutomationExecutionService {
  constructor(
    private readonly executionRepo: AutomationExecutionRepository,
    private readonly automationRepo: AutomationRepository,
  ) {}

  async createExecution(
    automationId: string,
    workspaceId: string,
    triggerPayload: TriggerPayload,
  ): Promise<AutomationExecution> {
    return this.executionRepo.create({
      workspace: { connect: { id: workspaceId } },
      automation: { connect: { id: automationId } },
      triggerPayload: triggerPayload.eventData as unknown as Prisma.InputJsonValue,
      status: 'PENDING',
    });
  }

  async markProcessing(executionId: string): Promise<AutomationExecution> {
    return this.executionRepo.update(executionId, {
      status: 'PROCESSING',
      startedAt: new Date(),
    });
  }

  async markSuccess(executionId: string): Promise<AutomationExecution> {
    return this.executionRepo.update(executionId, {
      status: 'SUCCESS',
      completedAt: new Date(),
    });
  }

  async markFailed(executionId: string, error: string): Promise<AutomationExecution> {
    return this.executionRepo.update(executionId, {
      status: 'FAILED',
      completedAt: new Date(),
      error,
    });
  }

  async listExecutions(
    workspaceId: string,
    automationId: string,
    query: ListExecutionsQuery,
  ): Promise<PaginatedExecutionsResponse> {
    const automation = await this.automationRepo.findByIdAndWorkspace(automationId, workspaceId);

    if (!automation) {
      throw new NotFoundException(AUTOMATION_ERRORS.NOT_FOUND);
    }

    const pagination = toPrismaOffset({ page: query.page, limit: query.limit });
    const statusFilter = query.status
      ? (query.status as Parameters<typeof this.executionRepo.findManyByAutomation>[1])
      : undefined;

    const [executions, total] = await Promise.all([
      this.executionRepo.findManyByAutomation(automationId, statusFilter, pagination),
      this.executionRepo.countByAutomation(automationId, statusFilter),
    ]);

    return {
      items: toExecutionResponses(executions),
      pagination: buildOffsetPaginationMeta({ page: query.page, limit: query.limit }, total),
    };
  }

  async getExecutionDetail(
    workspaceId: string,
    automationId: string,
    executionId: string,
  ): Promise<AutomationExecutionResponse> {
    const automation = await this.automationRepo.findByIdAndWorkspace(automationId, workspaceId);

    if (!automation) {
      throw new NotFoundException(AUTOMATION_ERRORS.NOT_FOUND);
    }

    const execution = await this.executionRepo.findByIdAndAutomation(executionId, automationId);

    if (!execution) {
      throw new NotFoundException(AUTOMATION_ERRORS.EXECUTION_NOT_FOUND);
    }

    return toExecutionResponse(execution);
  }
}
