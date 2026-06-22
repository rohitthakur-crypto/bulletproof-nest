import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';

import { AUTOMATION_EXECUTE_JOB_NAME, AUTOMATION_QUEUE_NAME } from '../constants';
import type { AutomationJobPayload } from '../interfaces';
import { AutomationWorkerService } from '../services/automation-worker.service';

@Processor(AUTOMATION_QUEUE_NAME)
export class AutomationProcessor extends WorkerHost {
  private readonly logger = new Logger(AutomationProcessor.name);

  constructor(private readonly automationWorkerService: AutomationWorkerService) {
    super();
  }

  async process(job: Job<AutomationJobPayload>): Promise<void> {
    if (job.name !== AUTOMATION_EXECUTE_JOB_NAME) {
      this.logger.warn(`Unknown job name: ${job.name}`);
      return;
    }

    this.logger.debug(`Processing execution ${job.data.executionId} (job ${job.id})`);

    await this.automationWorkerService.processExecution(job.data);
  }
}
