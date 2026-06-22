import type { AutomationTriggerType } from '@prisma/client';

export interface AutomationContext {
  automationId: string;
  executionId: string;
  workspaceId: string;
  socialAccountId: string;
  triggerPayload: Record<string, unknown>;
}

export interface TriggerPayload {
  workspaceId: string;
  socialAccountId: string;
  triggerType: AutomationTriggerType;
  eventData: Record<string, unknown>;
  externalEventId?: string;
}

export interface AutomationJobPayload {
  executionId: string;
  automationId: string;
  workspaceId: string;
}
