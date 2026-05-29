import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './controllers/health.controller';
import { DiskHealthIndicator } from './indicators/disk.health';
import { MemoryHealthIndicator } from './indicators/memory.health';
import { PrismaHealthIndicator } from './indicators/prisma.health';
import { QueueHealthIndicator } from './indicators/queue.health';
import { RedisHealthIndicator } from './indicators/redis.health';
import { UptimeHealthIndicator } from './indicators/uptime.health';
import { HealthService } from './services/health.service';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [
    HealthService,
    PrismaHealthIndicator,
    RedisHealthIndicator,
    QueueHealthIndicator,
    MemoryHealthIndicator,
    DiskHealthIndicator,
    UptimeHealthIndicator,
  ],
})
export class HealthModule {}
