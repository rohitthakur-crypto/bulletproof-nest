import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import type { Queue } from 'bullmq';

import { AUTOMATION_EXECUTE_JOB_NAME, AUTOMATION_QUEUE_NAME } from '../constants';
import type { AutomationJobPayload } from '../interfaces';

@Injectable()
export class AutomationQueueService {
  private readonly logger = new Logger(AutomationQueueService.name);

  constructor(
    @InjectQueue(AUTOMATION_QUEUE_NAME) private readonly queue: Queue<AutomationJobPayload>,
  ) {}

  async enqueueExecution(payload: AutomationJobPayload): Promise<void> {
    await this.queue.add(AUTOMATION_EXECUTE_JOB_NAME, payload, {
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 200 },
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });

    this.logger.debug(
      `Enqueued execution ${payload.executionId} for automation ${payload.automationId}`,
    );
  }
}
