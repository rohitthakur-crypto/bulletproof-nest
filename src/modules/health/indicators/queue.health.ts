import { Injectable } from '@nestjs/common';
import { HealthIndicatorService, type HealthIndicatorResult } from '@nestjs/terminus';

import { HEALTH_SERVICE_KEYS } from '../constants/health.constants';

@Injectable()
export class QueueHealthIndicator {
  constructor(private readonly healthIndicatorService: HealthIndicatorService) {}

  /**
   * TODO: Wire to BullMQ/QueueService when infra/bullmq module is implemented.
   * Expected: verify queue connection and Redis backend reachability.
   */
  isHealthy(key = HEALTH_SERVICE_KEYS.QUEUE): Promise<HealthIndicatorResult> {
    return Promise.resolve(
      this.healthIndicatorService.check(key).up({
        configured: false,
        message: 'QueueModule not configured yet',
      }),
    );
  }

  isConfigured(): boolean {
    return false;
  }
}
