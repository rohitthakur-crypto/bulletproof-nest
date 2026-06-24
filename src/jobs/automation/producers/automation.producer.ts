import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import type { Queue } from 'bullmq';

import {
  AUTOMATION_JOBS,
  AUTOMATION_QUEUES,
  TRIGGER_JOB_OPTIONS,
  EXECUTION_JOB_OPTIONS,
  ACTION_JOB_OPTIONS,
} from '../constants';
import type { CommentTriggerJob, ExecuteWorkflowJob, ExecutionJob, SendDmJob } from '../interfaces';

@Injectable()
export class AutomationProducer {
  private readonly logger = new Logger(AutomationProducer.name);

  constructor(
    @InjectQueue(AUTOMATION_QUEUES.TRIGGER)
    private readonly triggerQueue: Queue,
    @InjectQueue(AUTOMATION_QUEUES.EXECUTION)
    private readonly executionQueue: Queue<ExecutionJob>,
    @InjectQueue(AUTOMATION_QUEUES.ACTION)
    private readonly actionQueue: Queue,
  ) {}

  async handleComment(payload: CommentTriggerJob): Promise<void> {
    await this.triggerQueue.add(AUTOMATION_JOBS.HANDLE_COMMENT, payload, TRIGGER_JOB_OPTIONS);

    this.logger.debug(
      `Queued comment trigger for account ${payload.socialAccountId}, comment ${payload.externalCommentId}`,
    );
  }

  async executeWorkflow(payload: ExecuteWorkflowJob): Promise<void> {
    await this.triggerQueue.add(AUTOMATION_JOBS.EXECUTE_WORKFLOW, payload, TRIGGER_JOB_OPTIONS);

    this.logger.debug(
      `Queued workflow trigger ${payload.triggerType} for account ${payload.socialAccountId}`,
    );
  }

  async enqueueExecution(payload: ExecutionJob): Promise<void> {
    await this.executionQueue.add(AUTOMATION_JOBS.EXECUTE, payload, EXECUTION_JOB_OPTIONS);

    this.logger.debug(
      `Queued execution ${payload.executionId} for automation ${payload.automationId}`,
    );
  }

  async sendDm(payload: SendDmJob): Promise<void> {
    await this.actionQueue.add(AUTOMATION_JOBS.SEND_DM, payload, ACTION_JOB_OPTIONS);

    this.logger.debug(
      `Queued send-dm to recipient ${payload.recipientId} from account ${payload.socialAccountId}`,
    );
  }
}
