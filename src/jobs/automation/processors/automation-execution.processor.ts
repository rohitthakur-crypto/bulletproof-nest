import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';

import { AUTOMATION_JOBS, AUTOMATION_QUEUES } from '../constants';
import type { ExecutionJob } from '../interfaces';

import { AutomationWorkerService } from '@/modules/automation/services/automation-worker.service';

@Processor(AUTOMATION_QUEUES.EXECUTION)
export class AutomationExecutionProcessor extends WorkerHost {
  private readonly logger = new Logger(AutomationExecutionProcessor.name);

  constructor(private readonly automationWorkerService: AutomationWorkerService) {
    super();
  }

  async process(job: Job<ExecutionJob>): Promise<void> {
    if (job.name !== AUTOMATION_JOBS.EXECUTE) {
      this.logger.warn(`Unknown job name: ${job.name}`);
      return;
    }

    this.logger.debug(`Processing execution ${job.data.executionId} (job ${job.id})`);

    await this.automationWorkerService.processExecution(job.data);
  }
}
