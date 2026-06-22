import { Injectable, Logger } from '@nestjs/common';

import { AutomationActionType } from '../../enums';
import type { ActionHandler, AutomationContext, FlowNode } from '../../interfaces';

@Injectable()
export class AiReplyHandler implements ActionHandler {
  private readonly logger = new Logger(AiReplyHandler.name);

  canHandle(nodeType: AutomationActionType): boolean {
    return nodeType === AutomationActionType.AI_REPLY;
  }

  async execute(node: FlowNode, context: AutomationContext): Promise<void> {
    this.logger.debug('AI reply triggered', { node, context });
    // const { systemPrompt } = node.config as { systemPrompt?: string };
    // TODO: Integrate with AI provider (OpenAI / custom) to generate a reply
    // then send via MessagingService.
    // Example:
    //   const reply = await this.aiService.generateReply({
    //     systemPrompt: systemPrompt ?? '',
    //     userMessage: context.triggerPayload['messageText'] as string,
    //   });
    //   await this.messagingService.sendDm({ ... reply });
    // this.logger.debug(
    //   `[${context.executionId}] AI reply triggered in automation ${context.automationId}`,
    // );

    // TODO: Integrate with AI provider (OpenAI / custom) to generate a reply
    // then send via MessagingService.
    // Example:
    //   const reply = await this.aiService.generateReply({
    //     systemPrompt: systemPrompt ?? '',
    //     userMessage: context.triggerPayload['messageText'] as string,
    //   });
    //   await this.messagingService.sendDm({ ... reply });

    return new Promise((resolve) => resolve());

    // TODO: Integrate with AI provider (OpenAI / custom) to generate a reply
    // then send via MessagingService.
    // Example:
    //   const reply = await this.aiService.generateReply({
    //     systemPrompt: systemPrompt ?? '',
    //     userMessage: context.triggerPayload['messageText'] as string,
    //   });
    //   await this.messagingService.sendDm({ ... reply });
  }
}
