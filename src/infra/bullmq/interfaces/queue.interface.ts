import type { JobsOptions } from 'bullmq';

export interface QueueOptions {
  name: string;
  defaultJobOptions?: JobsOptions;
}

export interface AppJobOptions extends JobsOptions {
  traceId?: string;
}
