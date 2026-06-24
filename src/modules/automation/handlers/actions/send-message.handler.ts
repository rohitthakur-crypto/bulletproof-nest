import { Injectable } from '@nestjs/common';

import { AutomationActionType } from '../../enums';
import type { ActionHandler, AutomationContext, FlowNode } from '../../interfaces';
import { MetaDmService } from '../../services/meta-dm.service';
import { getEventDataString } from '../../utils';

import { AppLoggerService } from '@/core/logger/logger.service';

interface SendMessageNodeConfig {
  message: string;
}

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

    const commentId = getEventDataString(context.triggerPayload, 'externalCommentId');

    if (!commentId) {
      await this.metaDmService.sendPrivateReply(context.socialAccountId, commentId, config.message);

      this.logger.debug(
        `[${context.executionId}] Private reply sent for comment ${commentId} in automation ${context.automationId}`,
      );
      return;
    }

    const recipientId = getEventDataString(context.triggerPayload, 'senderId');

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
