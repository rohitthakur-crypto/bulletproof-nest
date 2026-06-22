import type { AutomationTriggerType } from '@prisma/client';

/**
 * Payload pushed to the `automation-trigger` queue when a generic workflow
 * execution needs to run (e.g. DM keyword, story mention, manual trigger).
 *
 * The processor resolves the matching automations, evaluates trigger config,
 * and dispatches action jobs as needed.
 */
export interface ExecuteWorkflowJob {
  /** Internal workspace ID */
  workspaceId: string;

  /** SocialAccount that received the event */
  socialAccountId: string;

  /** AutomationTriggerType (e.g. DM_KEYWORD, STORY_MENTION) */
  triggerType: AutomationTriggerType;

  /** Raw event data from the Meta webhook */
  eventData: Record<string, unknown>;

  /** Meta's event ID — used for idempotency */
  externalEventId?: string;
}
