import type { Automation } from '@prisma/client';

import type { AutomationDetailResponse, AutomationResponse } from '../dto/responses';

import { toIsoString } from '@/common/utils';

export function toAutomationResponse(automation: Automation): AutomationResponse {
  return {
    id: automation.id,
    workspaceId: automation.workspaceId,
    socialAccountId: automation.socialAccountId,
    createdById: automation.createdById,
    name: automation.name,
    description: automation.description ?? undefined,
    status: automation.status,
    triggerType: automation.triggerType,
    isAiEnabled: automation.isAiEnabled,
    publishedAt: toIsoString(automation.publishedAt),
    createdAt: toIsoString(automation.createdAt)!,
    updatedAt: toIsoString(automation.updatedAt)!,
  };
}

export function toAutomationDetailResponse(automation: Automation): AutomationDetailResponse {
  return {
    ...toAutomationResponse(automation),
    triggerConfig: (automation.triggerConfig ?? {}) as Record<string, unknown>,
    flowData: automation.flowData
      ? (automation.flowData as AutomationDetailResponse['flowData'])
      : null,
  };
}

export function toAutomationResponses(automations: Automation[]): AutomationResponse[] {
  return automations.map(toAutomationResponse);
}
