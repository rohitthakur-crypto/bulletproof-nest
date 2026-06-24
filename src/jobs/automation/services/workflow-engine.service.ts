import { Injectable, Logger } from '@nestjs/common';
import { AutomationTriggerType } from '@prisma/client';

import type { CommentTriggerJob, ExecuteWorkflowJob } from '../interfaces';
import { AutomationProducer } from '../producers/automation.producer';

import type { TriggerPayload } from '@/modules/automation/interfaces';
import { AutomationTriggerService } from '@/modules/automation/services/automation-trigger.service';

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(
    private readonly automationTriggerService: AutomationTriggerService,
    private readonly automationProducer: AutomationProducer,
  ) {}

  async handleComment(event: CommentTriggerJob): Promise<void> {
    this.logger.debug(
      `Processing comment trigger for account ${event.socialAccountId}, comment ${event.externalCommentId}`,
    );

    const payload: TriggerPayload = {
      workspaceId: event.workspaceId,
      socialAccountId: event.socialAccountId,
      triggerType: AutomationTriggerType.COMMENT_KEYWORD,
      eventData: {
        commentText: event.commentText,
        senderId: event.senderId,
        senderName: event.senderName ?? null,
        socialPostId: event.socialPostId ?? null,
        externalCommentId: event.externalCommentId,
        platform: event.platform,
        receivedAt: event.receivedAt,
      },
      externalEventId: event.externalCommentId,
    };

    await this.enqueueExecutions(payload);
  }

  async executeWorkflow(event: ExecuteWorkflowJob): Promise<void> {
    this.logger.debug(
      `Processing ${event.triggerType} trigger for account ${event.socialAccountId}`,
    );

    const payload: TriggerPayload = {
      workspaceId: event.workspaceId,
      socialAccountId: event.socialAccountId,
      triggerType: event.triggerType,
      eventData: event.eventData,
      externalEventId: event.externalEventId,
    };

    await this.enqueueExecutions(payload);
  }

  private async enqueueExecutions(payload: TriggerPayload): Promise<void> {
    const createdExecutions = await this.automationTriggerService.handleTrigger(payload);

    await Promise.all(
      createdExecutions.map((execution) => this.automationProducer.enqueueExecution(execution)),
    );
  }
}
