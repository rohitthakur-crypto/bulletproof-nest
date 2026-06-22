import { Injectable, Logger } from '@nestjs/common';

import { AutomationActionType } from '../../enums';
import type { ActionHandler, AutomationContext, FlowNode } from '../../interfaces';

@Injectable()
export class AddTagHandler implements ActionHandler {
  private readonly logger = new Logger(AddTagHandler.name);

  canHandle(nodeType: AutomationActionType): boolean {
    return nodeType === AutomationActionType.ADD_TAG;
  }

  async execute(node: FlowNode, context: AutomationContext): Promise<void> {
    const { tag } = node.config as { tag?: string };

    this.logger.debug(
      `[${context.executionId}] Adding tag "${tag}" in automation ${context.automationId}`,
    );
    return new Promise((resolve) => resolve());

    // TODO: Integrate with ContactService to add a tag to the contact who triggered this.
    // Example:
    //   const contactId = context.triggerPayload['contactId'] as string;
    //   await this.contactService.addTag(contactId, tag ?? '');
  }
}
