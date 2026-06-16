import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
  appConfig,
  databaseConfig,
  firebaseConfig,
  jwtConfig,
  loggerConfig,
  metaConfig,
  queueConfig,
  redisConfig,
  securityConfig,
} from './loaders';
import { AppConfigService } from './services/app-config.service';
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
        jwtConfig,
        redisConfig,
        firebaseConfig,
        queueConfig,
        loggerConfig,
        metaConfig,
        securityConfig,
      ],
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService, ConfigModule],
})
export class AppConfigModule {}
