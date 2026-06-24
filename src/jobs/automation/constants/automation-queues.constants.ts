import { QueueName } from '@/infra/bullmq/enums';

/** Automation-specific aliases over the global queue registry. */
export const AUTOMATION_QUEUES = {
  TRIGGER: QueueName.AUTOMATION_TRIGGER,
  EXECUTION: QueueName.AUTOMATION_EXECUTION,
  ACTION: QueueName.AUTOMATION_ACTION,
} as const;
