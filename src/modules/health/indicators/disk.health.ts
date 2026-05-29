import { Injectable } from '@nestjs/common';
import {
  DiskHealthIndicator as TerminusDiskHealthIndicator,
  HealthIndicatorService,
  type HealthIndicatorResult,
} from '@nestjs/terminus';

import {
  DISK_CHECK_PATH,
  DISK_FREE_THRESHOLD_PERCENT,
  HEALTH_SERVICE_KEYS,
} from '../constants/health.constants';

@Injectable()
export class DiskHealthIndicator {
  constructor(
    private readonly terminusDiskHealth: TerminusDiskHealthIndicator,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(
    key = HEALTH_SERVICE_KEYS.DISK,
  ): Promise<HealthIndicatorResult> {
    try {
      // Terminus expects minimum free percentage (e.g. 10 = at least 10% free).
      return await this.terminusDiskHealth.checkStorage(key, {
        path: DISK_CHECK_PATH,
        thresholdPercent: DISK_FREE_THRESHOLD_PERCENT,
      });
    } catch {
      return this.healthIndicatorService.check(key).down();
    }
  }
}
