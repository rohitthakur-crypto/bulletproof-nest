import { Injectable, Logger } from '@nestjs/common';

import type { SendDmJob } from '../interfaces';

import { MetaDmService } from '@/modules/automation/services/meta-dm.service';

@Injectable()
export class ActionExecutorService {
  private readonly logger = new Logger(ActionExecutorService.name);

  constructor(private readonly metaDmService: MetaDmService) {}

  /**
   * Sends a direct message via the Meta Graph API.
   * Called by AutomationActionProcessor when a SEND_DM job is dequeued.
   *
   * This path is used for standalone / deferred DM delivery that bypasses
   * the inline workflow runner — e.g. retries, manual sends, or future
   * scheduled messages.
   */
  async sendDm(job: SendDmJob): Promise<void> {
    this.logger.debug(
      `Sending DM for execution ${job.executionId}, recipient ${job.recipientId}, account ${job.socialAccountId}`,
    );

    await this.metaDmService.sendDirectMessage(job.socialAccountId, job.recipientId, job.message);

    this.logger.debug(`DM delivered for execution ${job.executionId}`);
  }
}
