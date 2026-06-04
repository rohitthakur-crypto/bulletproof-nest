import os from 'node:os';

import { Injectable } from '@nestjs/common';
import { HealthIndicatorService, type HealthIndicatorResult } from '@nestjs/terminus';

import {
  HEALTH_SERVICE_KEYS,
  MEMORY_HEAP_THRESHOLD_PERCENT,
  MEMORY_RSS_THRESHOLD_PERCENT,
} from '../constants/health.constants';

@Injectable()
export class MemoryHealthIndicator {
  constructor(private readonly healthIndicatorService: HealthIndicatorService) {}

  isHealthy(key = HEALTH_SERVICE_KEYS.MEMORY): Promise<HealthIndicatorResult> {
    const memory = process.memoryUsage();
    const heapUsedPercent = (memory.heapUsed / memory.heapTotal) * 100;
    const rssUsedPercent = (memory.rss / os.totalmem()) * 100;

    const isHealthy =
      heapUsedPercent < MEMORY_HEAP_THRESHOLD_PERCENT &&
      rssUsedPercent < MEMORY_RSS_THRESHOLD_PERCENT;

    const details = {
      heapUsedMb: this.toMb(memory.heapUsed),
      heapTotalMb: this.toMb(memory.heapTotal),
      rssMb: this.toMb(memory.rss),
      externalMb: this.toMb(memory.external),
      heapUsedPercent: Number(heapUsedPercent.toFixed(2)),
      rssUsedPercent: Number(rssUsedPercent.toFixed(2)),
    };

    if (!isHealthy) {
      return Promise.resolve(this.healthIndicatorService.check(key).down(details));
    }

    return Promise.resolve(this.healthIndicatorService.check(key).up(details));
  }

  private toMb(bytes: number): number {
    return Number((bytes / 1024 / 1024).toFixed(2));
  }
}
