import { Injectable } from '@nestjs/common';
import { HealthIndicatorService, type HealthIndicatorResult } from '@nestjs/terminus';

import { HEALTH_SERVICE_KEYS } from '../constants/health.constants';

@Injectable()
export class UptimeHealthIndicator {
  constructor(private readonly healthIndicatorService: HealthIndicatorService) {}

  isHealthy(key = HEALTH_SERVICE_KEYS.UPTIME): Promise<HealthIndicatorResult> {
    return Promise.resolve(
      this.healthIndicatorService.check(key).up({
        uptimeSeconds: Math.floor(process.uptime()),
      }),
    );
  }

  getProcessUptimeSeconds(): number {
    return Math.floor(process.uptime());
  }
}
