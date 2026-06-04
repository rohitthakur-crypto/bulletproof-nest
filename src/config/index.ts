export { AppConfigModule } from './config.module';

export { AppConfigService } from './app-config.service';

export { validateEnv, env } from './validation/validate-env';

export type { AppConfig } from './namespaces/app.config';

export type { DatabaseConfig } from './namespaces/database.config';

export type {
  JwtConfig,
  JwtKeyPairConfig,
  UserJwtConfig,
  AdminJwtConfig,
} from './namespaces/jwt.config';

export type { FirebaseConfig } from './namespaces/firebase.config';

export type { QueueConfig } from './namespaces/queue.config';

export type { RedisConfig } from './namespaces/redis.config';

export type { LoggerConfig } from './namespaces/logger.config';
