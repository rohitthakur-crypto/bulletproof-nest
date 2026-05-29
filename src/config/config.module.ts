import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppConfigService } from './app-config.service'; // TODO: move to services folder
import { appConfig } from './namespaces/app.config';
import { authConfig } from './namespaces/auth.config';
import { databaseConfig } from './namespaces/database.config';
import { firebaseConfig } from './namespaces/firebase.config';
import { loggerConfig } from './namespaces/logger.config';
import { queueConfig } from './namespaces/queue.config';
import { redisConfig } from './namespaces/redis.config';
import { validateEnv } from './validation/validate-env';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validate: validateEnv,
      load: [
        appConfig,
        databaseConfig,
        authConfig,
        redisConfig,
        firebaseConfig,
        queueConfig,
        loggerConfig,
      ],
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService, ConfigModule],
})
export class AppConfigModule {}
