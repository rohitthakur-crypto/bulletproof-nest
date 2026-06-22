import type { AutomationExecution } from '@prisma/client';

import type { AutomationExecutionResponse } from '../dto/responses';

import { toIsoString } from '@/common/utils';

export function toExecutionResponse(execution: AutomationExecution): AutomationExecutionResponse {
  return {
    id: execution.id,
    workspaceId: execution.workspaceId,
    automationId: execution.automationId,
    status: execution.status,
    triggerPayload: execution.triggerPayload
      ? (execution.triggerPayload as Record<string, unknown>)
      : null,
    startedAt: toIsoString(execution.startedAt),
    completedAt: toIsoString(execution.completedAt),
    error: execution.error ?? undefined,
    executedAt: toIsoString(execution.executedAt)!,
  };
}

export function toExecutionResponses(
  executions: AutomationExecution[],
): AutomationExecutionResponse[] {
  return executions.map(toExecutionResponse);
}
