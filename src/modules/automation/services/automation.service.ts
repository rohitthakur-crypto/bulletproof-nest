import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SocialAccountStatus } from '@prisma/client';

import { AUTOMATION_ERRORS } from '../constants';
import type { AutomationDetailResponse, AutomationResponse } from '../dto/responses';
import { toAutomationDetailResponse, toAutomationResponse } from '../mappers';
import { AutomationRepository } from '../repositories/automation.repository';
import type { CreateAutomationType, UpdateAutomationType } from '../validators';

import { SocialAccountsRepository } from '@/modules/social-accounts/repositories/social-accounts.repository';
import type { AuthenticatedUser } from '@/modules/user-auth/interfaces';

@Injectable()
export class AutomationService {
  constructor(
    private readonly automationRepo: AutomationRepository,
    private readonly socialAccountRepo: SocialAccountsRepository,
  ) {}

  async create(
    workspaceId: string,
    user: AuthenticatedUser,
    dto: CreateAutomationType,
  ): Promise<AutomationDetailResponse> {
    const account = await this.socialAccountRepo.findByIdAndWorkspace(
      dto.socialAccountId,
      workspaceId,
    );

    if (!account || account.status !== SocialAccountStatus.ACTIVE) {
      throw new BadRequestException(AUTOMATION_ERRORS.SOCIAL_ACCOUNT_NOT_FOUND);
    }

    const automation = await this.automationRepo.create({
      workspace: { connect: { id: workspaceId } },
      socialAccount: { connect: { id: dto.socialAccountId } },
      createdBy: { connect: { id: user.userId } },
      name: dto.name,
      description: dto.description ?? null,
      triggerType: dto.triggerType,
      triggerConfig: dto.triggerConfig as unknown as Prisma.InputJsonValue,
      flowData: dto.flowData ? (dto.flowData as unknown as Prisma.InputJsonValue) : undefined,
      isAiEnabled: dto.isAiEnabled ?? false,
      status: 'DRAFT',
    });

    return toAutomationDetailResponse(automation);
  }

  async update(
    workspaceId: string,
    id: string,
    dto: UpdateAutomationType,
  ): Promise<AutomationDetailResponse> {
    const automation = await this.automationRepo.findByIdAndWorkspace(id, workspaceId);

    if (!automation) {
      throw new NotFoundException(AUTOMATION_ERRORS.NOT_FOUND);
    }

    const updated = await this.automationRepo.update(id, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.triggerConfig !== undefined && {
        triggerConfig: dto.triggerConfig,
      }),
      ...(dto.flowData !== undefined && {
        flowData: dto.flowData as unknown as Prisma.InputJsonValue,
      }),
      ...(dto.isAiEnabled !== undefined && { isAiEnabled: dto.isAiEnabled }),
    });

    return toAutomationDetailResponse(updated);
  }

  async delete(workspaceId: string, id: string): Promise<AutomationResponse> {
    const automation = await this.automationRepo.findByIdAndWorkspace(id, workspaceId);

    if (!automation) {
      throw new NotFoundException(AUTOMATION_ERRORS.NOT_FOUND);
    }

    const deleted = await this.automationRepo.delete(id);

    return toAutomationResponse(deleted);
  }

  async duplicate(
    workspaceId: string,
    id: string,
    user: AuthenticatedUser,
  ): Promise<AutomationDetailResponse> {
    const source = await this.automationRepo.findByIdAndWorkspace(id, workspaceId);

    if (!source) {
      throw new NotFoundException(AUTOMATION_ERRORS.NOT_FOUND);
    }

    const copy = await this.automationRepo.create({
      workspace: { connect: { id: workspaceId } },
      socialAccount: { connect: { id: source.socialAccountId } },
      createdBy: { connect: { id: user.userId } },
      name: `${source.name} (copy)`,
      description: source.description ?? null,
      triggerType: source.triggerType,
      triggerConfig: source.triggerConfig as unknown as Prisma.InputJsonValue,
      flowData: source.flowData ? source.flowData : undefined,
      isAiEnabled: source.isAiEnabled,
      status: 'DRAFT',
    });

    return toAutomationDetailResponse(copy);
  }

  async archive(workspaceId: string, id: string): Promise<AutomationResponse> {
    const automation = await this.automationRepo.findByIdAndWorkspace(id, workspaceId);

    if (!automation) {
      throw new NotFoundException(AUTOMATION_ERRORS.NOT_FOUND);
    }

    if (automation.status === 'ARCHIVED') {
      throw new BadRequestException(AUTOMATION_ERRORS.ALREADY_ARCHIVED);
    }

    if (automation.status === 'ACTIVE') {
      throw new BadRequestException(AUTOMATION_ERRORS.CANNOT_ARCHIVE_ACTIVE);
    }

    const archived = await this.automationRepo.update(id, { status: 'ARCHIVED' });

    return toAutomationResponse(archived);
  }
}
