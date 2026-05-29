import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorService,
  type HealthIndicatorResult,
} from '@nestjs/terminus';

import { HEALTH_SERVICE_KEYS } from '../constants/health.constants';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  /**
   * TODO: Wire to RedisService when infra/redis module is implemented.
   * Expected: PING command with HEALTH_CHECK_TIMEOUT_MS timeout.
   */
  isHealthy(key = HEALTH_SERVICE_KEYS.REDIS): Promise<HealthIndicatorResult> {
    return Promise.resolve(
      this.healthIndicatorService.check(key).up({
        configured: false,
        message: 'RedisModule not configured yet',
      }),
    );
  }

  isConfigured(): boolean {
    return false;
  }
}
