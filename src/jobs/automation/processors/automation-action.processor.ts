import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { AUTOMATION_JOBS, AUTOMATION_QUEUES } from '../constants';
import type { SendDmJob } from '../interfaces';
import { ActionExecutorService } from '../services/action-executor.service';

@Processor(AUTOMATION_QUEUES.ACTION)
export class AutomationActionProcessor extends WorkerHost {
  private readonly logger = new Logger(AutomationActionProcessor.name);

  constructor(private readonly actionExecutor: ActionExecutorService) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case AUTOMATION_JOBS.SEND_DM:
        await this.actionExecutor.sendDm(job.data as SendDmJob);
        break;

      default:
        this.logger.warn(`[${AUTOMATION_QUEUES.ACTION}] Unknown job name: ${job.name}`);
    }
  }
}
