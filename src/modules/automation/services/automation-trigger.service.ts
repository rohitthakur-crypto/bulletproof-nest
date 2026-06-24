import { Injectable, Logger } from '@nestjs/common';

import { AnyCommentHandler } from '../handlers/triggers/any-comment.handler';
import { CommentKeywordHandler } from '../handlers/triggers/comment-keyword.handler';
import { DmReceivedHandler } from '../handlers/triggers/dm-received.handler';
import { MentionHandler } from '../handlers/triggers/mention.handler';
import type { TriggerHandler } from '../interfaces/action-handler.interface';
import type { CreatedExecution, TriggerPayload } from '../interfaces/automation-context.interface';
import type { TriggerConfig } from '../interfaces/trigger-config.interface';
import { AutomationRepository } from '../repositories/automation.repository';

import { AutomationExecutionService } from './automation-execution.service';

@Injectable()
export class AutomationTriggerService {
  private readonly logger = new Logger(AutomationTriggerService.name);

  private readonly triggerHandlers: TriggerHandler[];

  constructor(
    private readonly automationRepo: AutomationRepository,
    private readonly executionService: AutomationExecutionService,
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
   * Finds matching active automations, evaluates trigger config, and creates executions.
   * Returns created executions for the jobs layer to enqueue.
   */
  async handleTrigger(payload: TriggerPayload): Promise<CreatedExecution[]> {
    const matchingAutomations = await this.automationRepo.findActiveByTriggerAndAccount(
      payload.socialAccountId,
      payload.triggerType,
    );

    if (matchingAutomations.length === 0) {
      return [];
    }

    const handler = this.triggerHandlers.find((h) => h.canHandle(payload.triggerType));
    const createdExecutions: CreatedExecution[] = [];

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

        createdExecutions.push({
          executionId: execution.id,
          automationId: automation.id,
          workspaceId: automation.workspaceId,
        });

        this.logger.debug(`Created execution ${execution.id} for automation ${automation.id}`);
      } catch (error) {
        this.logger.error(`Failed to create execution for automation ${automation.id}`, error);
      }
    }

    return createdExecutions;
  }
}
