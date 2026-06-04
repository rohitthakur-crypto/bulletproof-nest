import { Injectable } from '@nestjs/common';
import { HealthIndicatorService, type HealthIndicatorResult } from '@nestjs/terminus';

import { HEALTH_CHECK_TIMEOUT_MS, HEALTH_SERVICE_KEYS } from '../constants/health.constants';

import { PrismaService } from '@/infra/prisma';

@Injectable()
export class PrismaHealthIndicator {
  constructor(
    private readonly prisma: PrismaService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key = HEALTH_SERVICE_KEYS.DATABASE): Promise<HealthIndicatorResult> {
    const startedAt = Date.now();

    try {
      const isHealthy = await this.withTimeout(this.prisma.isHealthy());

      if (!isHealthy) {
        throw new Error('Database probe returned unhealthy');
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

  private withTimeout(promise: Promise<boolean>): Promise<boolean> {
    return Promise.race([
      promise,
      new Promise<boolean>((_, reject) => {
        setTimeout(
          () => reject(new Error('Database health check timed out')),
          HEALTH_CHECK_TIMEOUT_MS,
        );
      }),
    ]);
  }
}
