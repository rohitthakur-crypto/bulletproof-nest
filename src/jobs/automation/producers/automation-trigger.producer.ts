import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

import { AUTOMATION_JOBS, AUTOMATION_QUEUES } from '../constants';
import type { CommentTriggerJob, ExecuteWorkflowJob } from '../interfaces';

@Injectable()
export class AutomationTriggerProducer {
  private readonly logger = new Logger(AutomationTriggerProducer.name);

  constructor(
    @InjectQueue(AUTOMATION_QUEUES.TRIGGER)
    private readonly queue: Queue,
  ) {}

  /**
   * Enqueue a comment event for automation trigger evaluation.
   * Called by the Meta webhook handler when a new comment is received.
   */
  async handleComment(payload: CommentTriggerJob): Promise<void> {
    await this.queue.add(AUTOMATION_JOBS.HANDLE_COMMENT, payload, {
      removeOnComplete: { count: 200 },
      removeOnFail: { count: 500 },
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });

    this.logger.debug(
      `Queued comment trigger for account ${payload.socialAccountId}, comment ${payload.externalCommentId}`,
    );
  }

  /**
   * Enqueue a generic workflow execution event (DM keyword, mention, etc.).
   * Called by the Meta webhook handler for non-comment trigger types.
   */
  async executeWorkflow(payload: ExecuteWorkflowJob): Promise<void> {
    await this.queue.add(AUTOMATION_JOBS.EXECUTE_WORKFLOW, payload, {
      removeOnComplete: { count: 200 },
      removeOnFail: { count: 500 },
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });

    this.logger.debug(
      `Queued workflow execution for trigger ${payload.triggerType}, account ${payload.socialAccountId}`,
    );
  }
}
