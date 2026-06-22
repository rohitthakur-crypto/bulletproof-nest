import { Injectable, Logger } from '@nestjs/common';
import { AutomationTriggerType } from '@prisma/client';

import type { CommentTriggerJob, ExecuteWorkflowJob } from '../interfaces';

import type { TriggerPayload } from '@/modules/automation/interfaces';
import { AutomationTriggerService } from '@/modules/automation/services/automation-trigger.service';

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(private readonly automationTriggerService: AutomationTriggerService) {}

  /**
   * Handles a comment trigger event from the Meta webhook.
   * Converts the raw job payload into a TriggerPayload and delegates to
   * AutomationTriggerService, which:
   *  1. Finds matching ACTIVE automations (COMMENT_KEYWORD trigger type)
   *  2. Evaluates keyword matching via CommentKeywordHandler
   *  3. Creates AutomationExecution records
   *  4. Enqueues execution jobs to the automation worker queue
   */
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

    await this.automationTriggerService.handleTrigger(payload);
  }

  /**
   * Handles a generic workflow trigger event (DM keyword, story mention, etc.).
   * Converts the job payload and delegates to AutomationTriggerService.
   */
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

    await this.automationTriggerService.handleTrigger(payload);
  }
}
