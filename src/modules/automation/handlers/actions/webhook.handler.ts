import { Injectable } from '@nestjs/common';

import { AutomationActionType } from '../../enums';
import type { ActionHandler } from '../../interfaces/action-handler.interface';
import type { AutomationContext } from '../../interfaces/automation-context.interface';
import type { FlowNode } from '../../interfaces/flow-data.interface';

import { HttpMethod } from '@/common/enums';
import { AppLoggerService } from '@/core/logger/logger.service';
import { HttpClientService } from '@/infra/http/http-client.service';

@Injectable()
export class WebhookActionHandler implements ActionHandler {
  constructor(
    private readonly http: HttpClientService,
    private readonly logger: AppLoggerService,
  ) {}

  canHandle(nodeType: AutomationActionType): boolean {
    return nodeType === AutomationActionType.WEBHOOK;
  }

  async execute(node: FlowNode, context: AutomationContext): Promise<void> {
    const { url, headers = {} } = node.config as {
      url?: string;
      headers?: Record<string, string>;
    };

    if (!url) {
      this.logger.debug(
        `[${context.executionId}] Webhook action skipped: no URL configured in node ${node.id}`,
      );
      return;
    }

    this.logger.debug(
      `[${context.executionId}] Calling external webhook ${url} in automation ${context.automationId}`,
    );

    await this.http.request({
      method: HttpMethod.POST,
      url,
      data: {
        executionId: context.executionId,
        automationId: context.automationId,
        workspaceId: context.workspaceId,
        triggerPayload: context.triggerPayload,
      },
      headers,
    });
  }
}
