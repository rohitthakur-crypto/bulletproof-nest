import { Injectable, NotFoundException } from '@nestjs/common';

import { AUTOMATION_ERRORS } from '../constants';
import type { AutomationDetailResponse, PaginatedAutomationsResponse } from '../dto/responses';
import { toAutomationDetailResponse, toAutomationResponses } from '../mappers';
import { AutomationRepository } from '../repositories/automation.repository';
import type { ListAutomationsQuery } from '../validators';

import {
  buildOffsetPaginationMeta,
  toPrismaOffset,
} from '@/infra/prisma/helpers/pagination.helper';

@Injectable()
export class AutomationQueryService {
  constructor(private readonly automationRepo: AutomationRepository) {}

  async listAutomations(
    workspaceId: string,
    query: ListAutomationsQuery,
  ): Promise<PaginatedAutomationsResponse> {
    const pagination = toPrismaOffset({ page: query.page, limit: query.limit });

    const [automations, total] = await Promise.all([
      this.automationRepo.findManyByWorkspace(workspaceId, query, pagination),
      this.automationRepo.countByWorkspace(workspaceId, query),
    ]);

    return {
      items: toAutomationResponses(automations),
      pagination: buildOffsetPaginationMeta({ page: query.page, limit: query.limit }, total),
    };
  }

  async getAutomationDetail(workspaceId: string, id: string): Promise<AutomationDetailResponse> {
    const automation = await this.automationRepo.findByIdAndWorkspace(id, workspaceId);

    if (!automation) {
      throw new NotFoundException(AUTOMATION_ERRORS.NOT_FOUND);
    }

    return toAutomationDetailResponse(automation);
  }
}
