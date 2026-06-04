import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { AppConfig } from './namespaces/app.config';
import type { DatabaseConfig } from './namespaces/database.config';
import type { FirebaseConfig } from './namespaces/firebase.config';
import type { JwtConfig } from './namespaces/jwt.config';
import type { LoggerConfig } from './namespaces/logger.config';
import type { QueueConfig } from './namespaces/queue.config';
import type { RedisConfig } from './namespaces/redis.config';

/**
 * Strongly-typed facade over ConfigService.
 *
 * Inject AppConfigService instead of ConfigService throughout the app to get
 * full type inference with zero magic strings and no undefined returns.
 *
 * @example
 *   constructor(private readonly config: AppConfigService) {}
 *   const port = this.config.app.port;       // number
 *   const secret = this.config.jwt.secret;   // string
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get app(): AppConfig {
    return this.configService.getOrThrow<AppConfig>('app');
  }

  get database(): DatabaseConfig {
    return this.configService.getOrThrow<DatabaseConfig>('database');
  }

  // get auth(): AuthConfig {
  //   return this.configService.getOrThrow<AuthConfig>('auth');
  // }

  get jwt(): JwtConfig {
    return this.configService.getOrThrow<JwtConfig>('jwt');
  }

  get redis(): RedisConfig {
    return this.configService.getOrThrow<RedisConfig>('redis');
  }

  get firebase(): FirebaseConfig {
    return this.configService.getOrThrow<FirebaseConfig>('firebase');
  }

  get queue(): QueueConfig {
    return this.configService.getOrThrow<QueueConfig>('queue');
  }

  get logger(): LoggerConfig {
    return this.configService.getOrThrow<LoggerConfig>('logger');
  }
}
