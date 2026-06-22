import { JobsOptions } from 'bullmq';
export interface QueueConfig {
  readonly prefix: string;
  readonly db: number;
  readonly defaultJobOptions: JobsOptions;
  readonly redis: {
    readonly host: string;
    readonly port: number;
    readonly password: string;
    readonly tls: boolean;
  };
}
