import { HttpStatus, Injectable } from '@nestjs/common';
import { HealthCheckService, type HealthIndicatorResult } from '@nestjs/terminus';

import { HEALTH_SERVICE_KEYS } from '../constants/health.constants';
import { DiskHealthIndicator } from '../indicators/disk.health';
import { MemoryHealthIndicator } from '../indicators/memory.health';
import { PrismaHealthIndicator } from '../indicators/prisma.health';
import { QueueHealthIndicator } from '../indicators/queue.health';
import { RedisHealthIndicator } from '../indicators/redis.health';
import { UptimeHealthIndicator } from '../indicators/uptime.health';
import type {
  DetailedHealthData,
  HealthServiceStatus,
  ReadinessData,
  LivenessData,
} from '../interfaces/health.interface';

export interface ServiceResult<T> {
  data: T;
  httpStatus: number;
}
import type { IAppLogger } from '@/core/logger/logger.interface';
import { AppLoggerService } from '@/core/logger/logger.service';

@Injectable()
export class HealthService {
  private readonly logger: IAppLogger;

  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly redisHealth: RedisHealthIndicator,
    private readonly queueHealth: QueueHealthIndicator,
    private readonly memoryHealth: MemoryHealthIndicator,
    private readonly diskHealth: DiskHealthIndicator,
    private readonly uptimeHealth: UptimeHealthIndicator,
    appLogger: AppLoggerService,
  ) {
    this.logger = appLogger.child({ context: HealthService.name });
  }

  getLive(): LivenessData {
    return { status: 'alive' };
  }

  async getReady(): Promise<{ data: ReadinessData; httpStatus: number }> {
    const startedAt = Date.now();

    const database = await this.probeIndicator(HEALTH_SERVICE_KEYS.DATABASE, () =>
      this.prismaHealth.isHealthy(),
    );

    const redis = this.redisHealth.isConfigured()
      ? await this.probeIndicator(HEALTH_SERVICE_KEYS.REDIS, () => this.redisHealth.isHealthy())
      : ('skipped' as const);

    const queue = this.queueHealth.isConfigured()
      ? await this.probeIndicator(HEALTH_SERVICE_KEYS.QUEUE, () => this.queueHealth.isHealthy())
      : ('skipped' as const);

    const isReady =
      database === 'up' &&
      (redis === 'up' || redis === 'skipped') &&
      (queue === 'up' || queue === 'skipped');

    const data: ReadinessData = {
      status: isReady ? 'ok' : 'error',
      services: { database, redis, queue },
    };

    if (!isReady) {
      this.logger.warn('Readiness check failed', {
        services: data.services,
        durationMs: Date.now() - startedAt,
      });
    }

    return {
      data,
      httpStatus: isReady ? 200 : 503,
    };
  }

  async getDetailedHealth(): Promise<ServiceResult<DetailedHealthData>> {
    const startedAt = Date.now();

    const [database, redis, queue, memory, disk] = await Promise.all([
      this.probeIndicator(HEALTH_SERVICE_KEYS.DATABASE, () => this.prismaHealth.isHealthy()),

      this.probeSkippedOrActive(
        HEALTH_SERVICE_KEYS.REDIS,
        () => this.redisHealth.isConfigured(),
        () => this.redisHealth.isHealthy(),
      ),

      this.probeSkippedOrActive(
        HEALTH_SERVICE_KEYS.QUEUE,
        () => this.queueHealth.isConfigured(),
        () => this.queueHealth.isHealthy(),
      ),

      this.probeIndicator(HEALTH_SERVICE_KEYS.MEMORY, () => this.memoryHealth.isHealthy()),

      this.probeIndicator(HEALTH_SERVICE_KEYS.DISK, () => this.diskHealth.isHealthy()),
    ]);

    const services = { database, redis, queue, memory, disk };
    const overallStatus = this.resolveOverallStatus(services);

    if (overallStatus !== 'ok') {
      this.logger.warn('Health check degraded or failed', {
        services,
        overallStatus,
        durationMs: Date.now() - startedAt,
      });
    }

    return {
      data: {
        status: overallStatus,
        uptime: this.uptimeHealth.getProcessUptimeSeconds(),
        services,
      },
      httpStatus:
        overallStatus === 'error' ? Number(HttpStatus.SERVICE_UNAVAILABLE) : Number(HttpStatus.OK),
    };
  }

  /** Runs Terminus health check pipeline (used for observability integrations). */
  async runTerminusCheck() {
    return this.healthCheckService.check([
      () => this.prismaHealth.isHealthy(),
      () => this.memoryHealth.isHealthy(),
      () => this.diskHealth.isHealthy(),
      () => this.uptimeHealth.isHealthy(),
    ]);
  }

  private async probeIndicator(
    name: string,
    check: () => Promise<HealthIndicatorResult>,
  ): Promise<HealthServiceStatus> {
    const startedAt = Date.now();

    try {
      const result = await check();
      const status = this.extractServiceStatus(result, name);

      this.logger.debug('Health probe succeeded', {
        service: name,
        status,
        durationMs: Date.now() - startedAt,
      });

      return status;
    } catch (error) {
      this.logger.error(
        'Health probe failed',
        {
          service: name,
          durationMs: Date.now() - startedAt,
        },
        error instanceof Error ? error : undefined,
      );

      return 'down';
    }
  }

  private async probeSkippedOrActive(
    key: string,
    isConfigured: () => boolean,
    check: () => Promise<HealthIndicatorResult>,
  ): Promise<HealthServiceStatus> {
    if (!isConfigured()) {
      return 'skipped';
    }

    return this.probeIndicator(key, check);
  }

  private extractServiceStatus(result: HealthIndicatorResult, key: string): HealthServiceStatus {
    const entry = result[key] as { status: string; [key: string]: unknown } | undefined;

    if (!entry) {
      return 'down';
    }

    if (entry.status === 'skipped' || entry.configured === false) {
      return 'skipped';
    }

    return entry.status === 'up' ? 'up' : 'down';
  }

  private resolveOverallStatus(services: {
    database: HealthServiceStatus;
    redis: HealthServiceStatus;
    queue: HealthServiceStatus;
    memory: HealthServiceStatus;
    disk: HealthServiceStatus;
  }): DetailedHealthData['status'] {
    if (services.database === 'down') {
      return 'error';
    }

    const activeChecks = Object.values(services).filter((status) => status !== 'skipped');

    if (activeChecks.some((status) => status === 'down')) {
      return 'degraded';
    }

    return 'ok';
  }
}
