import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

import { AUTOMATION_JOBS, AUTOMATION_QUEUES } from '../constants';
import type { SendDmJob } from '../interfaces';

@Injectable()
export class AutomationActionProducer {
  private readonly logger = new Logger(AutomationActionProducer.name);

  constructor(
    @InjectQueue(AUTOMATION_QUEUES.ACTION)
    private readonly queue: Queue,
  ) {}

  /**
   * Enqueue a direct-message send action.
   * Used for standalone / deferred DM sending outside the inline workflow runner.
   */
  async sendDm(payload: SendDmJob): Promise<void> {
    await this.queue.add(AUTOMATION_JOBS.SEND_DM, payload, {
      removeOnComplete: { count: 200 },
      removeOnFail: { count: 500 },
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 },
    });

    this.logger.debug(
      `Queued send-dm to recipient ${payload.recipientId} from account ${payload.socialAccountId}`,
    );
  }
}
