import { Global, Module } from '@nestjs/common';
import { LoggerModule as NestPinoLoggerModule } from 'nestjs-pino';

import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { LoggerFactory } from './logger.factory';
import { AppLoggerService } from './logger.service';
import { createPinoModuleParams } from './pino/pino-options.factory';

import { AppConfigService } from '@/config/app-config.service';

@Global()
@Module({
  imports: [
    NestPinoLoggerModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) =>
        createPinoModuleParams(config.logger, config.app),
    }),
  ],
  providers: [AppLoggerService, LoggerFactory, LoggingInterceptor],
  exports: [
    AppLoggerService,
    LoggerFactory,
    LoggingInterceptor,
    NestPinoLoggerModule,
  ],
})
export class AppLoggerModule {}
