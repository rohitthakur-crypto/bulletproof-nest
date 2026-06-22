import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { AUTOMATION_JOBS, AUTOMATION_QUEUES } from '../constants';
import type { CommentTriggerJob, ExecuteWorkflowJob } from '../interfaces';
import { WorkflowEngineService } from '../services/workflow-engine.service';

@Processor(AUTOMATION_QUEUES.TRIGGER)
export class AutomationTriggerProcessor extends WorkerHost {
  private readonly logger = new Logger(AutomationTriggerProcessor.name);

  constructor(private readonly workflowEngine: WorkflowEngineService) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case AUTOMATION_JOBS.HANDLE_COMMENT:
        await this.workflowEngine.handleComment(job.data as CommentTriggerJob);
        break;

      case AUTOMATION_JOBS.EXECUTE_WORKFLOW:
        await this.workflowEngine.executeWorkflow(job.data as ExecuteWorkflowJob);
        break;

      default:
        this.logger.warn(`[${AUTOMATION_QUEUES.TRIGGER}] Unknown job name: ${job.name}`);
    }
  }
}
