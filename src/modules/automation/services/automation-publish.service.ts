import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { AUTOMATION_ERRORS } from '../constants';
import type { AutomationResponse } from '../dto/responses';
import { toAutomationResponse } from '../mappers';
import { AutomationRepository } from '../repositories/automation.repository';

@Injectable()
export class AutomationPublishService {
  constructor(private readonly automationRepo: AutomationRepository) {}

  async publish(workspaceId: string, id: string): Promise<AutomationResponse> {
    const automation = await this.automationRepo.findByIdAndWorkspace(id, workspaceId);

    if (!automation) {
      throw new NotFoundException(AUTOMATION_ERRORS.NOT_FOUND);
    }

    if (automation.status !== 'DRAFT') {
      throw new BadRequestException(AUTOMATION_ERRORS.NOT_DRAFT);
    }

    this.validateFlowForPublish(automation.flowData);

    const published = await this.automationRepo.update(id, {
      status: 'ACTIVE',
      publishedAt: new Date(),
    });

    return toAutomationResponse(published);
  }

  async pause(workspaceId: string, id: string): Promise<AutomationResponse> {
    const automation = await this.automationRepo.findByIdAndWorkspace(id, workspaceId);

    if (!automation) {
      throw new NotFoundException(AUTOMATION_ERRORS.NOT_FOUND);
    }

    if (automation.status !== 'ACTIVE') {
      throw new BadRequestException(AUTOMATION_ERRORS.NOT_ACTIVE);
    }

    const paused = await this.automationRepo.update(id, { status: 'PAUSED' });

    return toAutomationResponse(paused);
  }

  async resume(workspaceId: string, id: string): Promise<AutomationResponse> {
    const automation = await this.automationRepo.findByIdAndWorkspace(id, workspaceId);

    if (!automation) {
      throw new NotFoundException(AUTOMATION_ERRORS.NOT_FOUND);
    }

    if (automation.status !== 'PAUSED') {
      throw new BadRequestException(AUTOMATION_ERRORS.NOT_PAUSED);
    }

    const resumed = await this.automationRepo.update(id, { status: 'ACTIVE' });

    return toAutomationResponse(resumed);
  }

  // ─── Private ──────────────────────────────────────────────────────────────────

  private validateFlowForPublish(flowData: unknown): void {
    if (!flowData) {
      throw new BadRequestException(AUTOMATION_ERRORS.FLOW_REQUIRED_FOR_PUBLISH);
    }

    const flow = flowData as { nodes?: unknown[] };

    if (!Array.isArray(flow.nodes) || flow.nodes.length === 0) {
      throw new BadRequestException(AUTOMATION_ERRORS.FLOW_REQUIRED_FOR_PUBLISH);
    }
  }
}
