export const TRIGGER_JOB_OPTIONS = {
  removeOnComplete: { count: 200 },
  removeOnFail: { count: 500 },
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 1000 },
};

export const EXECUTION_JOB_OPTIONS = {
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 200 },
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 2000 },
};

export const ACTION_JOB_OPTIONS = {
  removeOnComplete: { count: 200 },
  removeOnFail: { count: 500 },
  attempts: 5,
  backoff: { type: 'exponential' as const, delay: 2000 },
};
