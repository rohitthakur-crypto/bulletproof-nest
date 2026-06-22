import { Injectable } from '@nestjs/common';
import { HealthIndicatorService, type HealthIndicatorResult } from '@nestjs/terminus';

import { HEALTH_CHECK_TIMEOUT_MS, HEALTH_SERVICE_KEYS } from '../constants/health.constants';

import { RedisService } from '@/infra/redis/redis.service';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly redisService: RedisService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key = HEALTH_SERVICE_KEYS.REDIS): Promise<HealthIndicatorResult> {
    const startedAt = Date.now();

    try {
      const response = await this.withTimeout(this.redisService.ping());

      if (response !== 'PONG') {
        throw new Error(`Unexpected ping response: ${response}`);
      }

      return this.healthIndicatorService.check(key).up({
        responseTimeMs: Date.now() - startedAt,
      });
    } catch {
      return this.healthIndicatorService.check(key).down({
        responseTimeMs: Date.now() - startedAt,
      });
    }
  }

  isConfigured(): boolean {
    return true;
  }

  private withTimeout(promise: Promise<string>): Promise<string> {
    return Promise.race([
      promise,
      new Promise<string>((_, reject) => {
        setTimeout(
          () => reject(new Error('Redis health check timed out')),
          HEALTH_CHECK_TIMEOUT_MS,
        );
      }),
    ]);
  }
}
