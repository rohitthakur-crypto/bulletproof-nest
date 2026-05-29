export type HealthServiceStatus = 'up' | 'down' | 'skipped';

export interface HealthServiceMap {
  database: HealthServiceStatus;
  redis: HealthServiceStatus;
  queue: HealthServiceStatus;
  memory: HealthServiceStatus;
  disk: HealthServiceStatus;
}

/** Returned by health service — wrapped in API `data` as-is. */
export interface DetailedHealthData {
  status: 'ok' | 'degraded' | 'error';
  uptime: number;
  services: HealthServiceMap;
}

export interface LivenessData {
  status: 'alive';
}

export interface ReadinessData {
  status: 'ok' | 'error';
  services: Pick<HealthServiceMap, 'database' | 'redis' | 'queue'>;
}

export interface HealthIndicatorProbeResult {
  status: HealthServiceStatus;
  responseTimeMs?: number;
}
