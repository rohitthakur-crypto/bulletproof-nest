import { Injectable } from '@nestjs/common';
import { AutomationStatus } from '@prisma/client';

import { AutomationActionType } from '../enums';
import { AddTagHandler } from '../handlers/actions/add-tag.handler';
import { AiReplyHandler } from '../handlers/actions/ai-reply.handler';
import { DelayHandler } from '../handlers/actions/delay.handler';
import { SendMessageHandler } from '../handlers/actions/send-message.handler';
import { WebhookActionHandler } from '../handlers/actions/webhook.handler';
import type {
  CreatedExecution,
  AutomationContext,
  ActionHandler,
  FlowData,
  FlowNode,
} from '../interfaces';
import { AutomationRepository } from '../repositories/automation.repository';

import { AutomationExecutionService } from './automation-execution.service';

import { AppLoggerService } from '@/core/logger/logger.service';

@Injectable()
export class AutomationWorkerService {
  private readonly actionHandlers: ActionHandler[];

  constructor(
    private readonly logger: AppLoggerService,
    private readonly automationRepo: AutomationRepository,
    private readonly executionService: AutomationExecutionService,
    sendMessageHandler: SendMessageHandler,
    delayHandler: DelayHandler,
    aiReplyHandler: AiReplyHandler,
    addTagHandler: AddTagHandler,
    webhookActionHandler: WebhookActionHandler,
  ) {
    this.actionHandlers = [
      sendMessageHandler,
      delayHandler,
      aiReplyHandler,
      addTagHandler,
      webhookActionHandler,
    ];
  }

  /**
   * Called by AutomationProcessor inside the BullMQ worker.
   * Loads the automation, executes all flow nodes in order, and updates the execution status.
   */
  async processExecution(payload: CreatedExecution): Promise<void> {
    const { executionId, automationId, workspaceId } = payload;

    await this.executionService.markProcessing(executionId);

    try {
      const automation = await this.automationRepo.findById(automationId);

      if (!automation) {
        throw new Error(`Automation ${automationId} not found`);
      }

      if (automation.status !== AutomationStatus.ACTIVE) {
        this.logger.warn(
          `Automation ${automationId} is no longer ACTIVE (status: ${automation.status}). Skipping execution ${executionId}.`,
        );
        await this.executionService.markFailed(
          executionId,
          `Automation is not active (status: ${automation.status})`,
        );
        return;
      }

      const flowData = automation.flowData as FlowData | null;

      if (!flowData?.nodes?.length) {
        await this.executionService.markSuccess(executionId);
        return;
      }

      const execution = await this.executionService.markProcessing(executionId);

      const context: AutomationContext = {
        automationId,
        executionId,
        workspaceId,
        socialAccountId: automation.socialAccountId,
        triggerPayload: (execution.triggerPayload ?? {}) as Record<string, unknown>,
      };

      await this.executeFlow(flowData.nodes, context);

      await this.executionService.markSuccess(executionId);

      this.logger.debug(`Execution ${executionId} completed successfully`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(`Execution ${executionId} failed: ${message}`, { error });

      await this.executionService.markFailed(executionId, message);

      throw error;
    }
  }

  // ─── Private ──────────────────────────────────────────────────────────────────

  private async executeFlow(nodes: FlowNode[], context: AutomationContext): Promise<void> {
    for (const node of nodes) {
      const handler = this.actionHandlers.find((h) =>
        h.canHandle(node.type as AutomationActionType),
      );

      if (!handler) {
        this.logger.debug(
          `[${context.executionId}] No handler found for node type "${node.type}" — skipping`,
        );
        continue;
      }

      await handler.execute(node, context);
    }
  }
}
