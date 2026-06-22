import { Injectable, Logger } from '@nestjs/common';

import { AnyCommentHandler } from '../handlers/triggers/any-comment.handler';
import { CommentKeywordHandler } from '../handlers/triggers/comment-keyword.handler';
import { DmReceivedHandler } from '../handlers/triggers/dm-received.handler';
import { MentionHandler } from '../handlers/triggers/mention.handler';
import type { TriggerHandler } from '../interfaces/action-handler.interface';
import type { TriggerPayload } from '../interfaces/automation-context.interface';
import type { TriggerConfig } from '../interfaces/trigger-config.interface';
import { AutomationQueueService } from '../jobs/automation.queue';
import { AutomationRepository } from '../repositories/automation.repository';

import { AutomationExecutionService } from './automation-execution.service';

@Injectable()
export class AutomationTriggerService {
  private readonly logger = new Logger(AutomationTriggerService.name);

  private readonly triggerHandlers: TriggerHandler[];

  constructor(
    private readonly automationRepo: AutomationRepository,
    private readonly executionService: AutomationExecutionService,
    private readonly queueService: AutomationQueueService,
    commentKeywordHandler: CommentKeywordHandler,
    anyCommentHandler: AnyCommentHandler,
    dmReceivedHandler: DmReceivedHandler,
    mentionHandler: MentionHandler,
  ) {
    this.triggerHandlers = [
      commentKeywordHandler,
      anyCommentHandler,
      dmReceivedHandler,
      mentionHandler,
    ];
  }

  /**
   * Entry point called by the webhook handler.
   * Finds all matching active automations and queues an execution for each.
   * Never executes actions directly — only creates records and enqueues jobs.
   */
  async handleTrigger(payload: TriggerPayload): Promise<void> {
    const matchingAutomations = await this.automationRepo.findActiveByTriggerAndAccount(
      payload.socialAccountId,
      payload.triggerType,
    );

    if (matchingAutomations.length === 0) {
      return;
    }

    const handler = this.triggerHandlers.find((h) => h.canHandle(payload.triggerType));

    for (const automation of matchingAutomations) {
      const triggerConfig = automation.triggerConfig as TriggerConfig;

      if (handler && !handler.matches(triggerConfig, payload)) {
        this.logger.debug(`Automation ${automation.id} did not match trigger config, skipping`);
        continue;
      }

      try {
        const execution = await this.executionService.createExecution(
          automation.id,
          automation.workspaceId,
          payload,
        );

        await this.queueService.enqueueExecution({
          executionId: execution.id,
          automationId: automation.id,
          workspaceId: automation.workspaceId,
        });

        this.logger.debug(`Queued execution ${execution.id} for automation ${automation.id}`);
      } catch (error) {
        this.logger.error(`Failed to queue execution for automation ${automation.id}`, error);
      }
    }
  }
}
