import { Injectable } from '@nestjs/common';

import { AutomationActionType } from '../../enums';
import type { ActionHandler, AutomationContext, FlowNode } from '../../interfaces';
import { MetaDmService } from '../../services/meta-dm.service';

import { AppLoggerService } from '@/core/logger/logger.service';

// ─── Node config shape ────────────────────────────────────────────────────────

interface SendMessageNodeConfig {
  message: string;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

@Injectable()
export class SendMessageHandler implements ActionHandler {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly metaDmService: MetaDmService,
  ) {}

  canHandle(nodeType: AutomationActionType): boolean {
    return nodeType === AutomationActionType.SEND_MESSAGE;
  }

  async execute(node: FlowNode, context: AutomationContext): Promise<void> {
    const config = node.config as unknown as SendMessageNodeConfig;

    if (!config.message) {
      this.logger.debug(
        `[${context.executionId}] send_message node ${node.id} has no message text — skipping`,
      );
      return;
    }

    const recipientId = context.triggerPayload['senderId'] as string | undefined;

    if (!recipientId) {
      this.logger.debug(`[${context.executionId}] No senderId in triggerPayload — cannot send DM`);
      return;
    }

    await this.metaDmService.sendDirectMessage(
      context.socialAccountId,
      recipientId,
      config.message,
    );

    this.logger.debug(
      `[${context.executionId}] DM sent to ${recipientId} in automation ${context.automationId}`,
    );
  }
}
