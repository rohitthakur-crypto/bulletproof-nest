import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type {
  AppConfig,
  DatabaseConfig,
  FirebaseConfig,
  JwtConfig,
  LoggerConfig,
  MetaConfig,
  QueueConfig,
  RedisConfig,
  SecurityConfig,
} from '../interfaces';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get app(): AppConfig {
    return this.configService.getOrThrow<AppConfig>('app');
  }

  get database(): DatabaseConfig {
    return this.configService.getOrThrow<DatabaseConfig>('database');
  }

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

  get meta(): MetaConfig {
    return this.configService.getOrThrow<MetaConfig>('meta');
  }

  get security(): SecurityConfig {
    return this.configService.getOrThrow<SecurityConfig>('security');
  }
}
