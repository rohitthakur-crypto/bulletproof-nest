import { Queue, QueueOptions } from 'bullmq';

import { DEFAULT_JOB_OPTIONS } from './bullmq.constants';
import { QueueName } from './enums';

export function createQueue(name: QueueName, options: QueueOptions): Queue {
  return new Queue(name, {
    ...options,
    defaultJobOptions: { ...DEFAULT_JOB_OPTIONS, ...options.defaultJobOptions },
  });
}
