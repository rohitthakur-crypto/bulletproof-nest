import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

import { AppConfigService } from '@/core/config';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly appConfig: AppConfigService) {
    const { host, port, password, tls } = appConfig.redis;

    this.client = new Redis({
      host,
      port,
      password: password || undefined,
      tls: tls ? {} : undefined,
      maxRetriesPerRequest: null,
      retryStrategy(times) {
        return Math.min(times * 200, 2_000);
      },
    });

    this.client.on('connect', () => this.logger.log('Redis connecting'));
    this.client.on('ready', () => this.logger.log('Redis connection ready'));
    this.client.on('error', (err: Error) => this.logger.error(`Redis error: ${err.message}`));
    this.client.on('close', () => this.logger.warn('Redis connection closed'));
    this.client.on('reconnecting', () => this.logger.warn('Redis reconnecting'));
  }

  getClient(): Redis {
    return this.client;
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
    this.logger.log('Redis client disconnected');
  }
}
