import { Processor, Worker, WorkerOptions } from 'bullmq';

import { DEFAULT_QUEUE_CONCURRENCY } from './bullmq.constants';
import { QueueName } from './enums';
import type { AppJobOptions } from './interfaces';

export function createWorker(
  queueName: QueueName,
  processor: Processor<AppJobOptions>,
  options: WorkerOptions,
): Worker {
  return new Worker(queueName, processor, {
    concurrency: options.concurrency ?? DEFAULT_QUEUE_CONCURRENCY,
    ...options,
  });
}
