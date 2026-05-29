/** Max time allowed for a dependency health probe before it is marked unhealthy. */
export const HEALTH_CHECK_TIMEOUT_MS = 3_000;

/** Heap usage threshold (percentage) before memory is reported unhealthy. */
export const MEMORY_HEAP_THRESHOLD_PERCENT = 90;

/** RSS usage threshold (percentage) relative to system memory. */
export const MEMORY_RSS_THRESHOLD_PERCENT = 90;

/** Minimum free disk space (percentage) before disk is reported unhealthy. */
export const DISK_FREE_THRESHOLD_PERCENT = 10;

/** Disk path checked for free space (root filesystem). */
export const DISK_CHECK_PATH = process.platform === 'win32' ? 'C:\\' : '/';

export const HEALTH_SERVICE_KEYS = {
  DATABASE: 'database',
  REDIS: 'redis',
  QUEUE: 'queue',
  MEMORY: 'memory',
  DISK: 'disk',
  UPTIME: 'uptime',
} as const;
