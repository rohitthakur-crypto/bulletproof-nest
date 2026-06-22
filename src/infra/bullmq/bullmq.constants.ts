export const DEFAULT_QUEUE_CONCURRENCY = 10;

export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 3000 },
  removeOnComplete: 1000,
  removeOnFail: 5000,
};
