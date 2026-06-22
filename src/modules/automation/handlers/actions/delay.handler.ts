import { Injectable } from '@nestjs/common';

import { AutomationActionType } from '../../enums';
import type { ActionHandler, AutomationContext, FlowNode } from '../../interfaces';

import { AppLoggerService } from '@/core/logger/logger.service';

@Injectable()
export class DelayHandler implements ActionHandler {
  constructor(private readonly logger: AppLoggerService) {}

  canHandle(nodeType: AutomationActionType): boolean {
    return nodeType === AutomationActionType.DELAY;
  }

  async execute(node: FlowNode, context: AutomationContext): Promise<void> {
    const { delayMs = 0 } = node.config as { delayMs?: number };

    this.logger.debug(
      `[${context.executionId}] Delaying ${delayMs}ms in automation ${context.automationId}`,
    );

    // TODO: For production, implement delays as a separate BullMQ job with a delay option
    // instead of blocking the worker process.
    if (delayMs > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    }

    return new Promise<void>((resolve) => resolve());
  }
}
