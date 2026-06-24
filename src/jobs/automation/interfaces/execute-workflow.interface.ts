import type { AutomationTriggerType } from '@prisma/client';

export interface ExecuteWorkflowJob {
  workspaceId: string;

  socialAccountId: string;

  triggerType: AutomationTriggerType;

  eventData: Record<string, unknown>;

  externalEventId?: string;
}
