import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';

import { AppConfigModule } from '@/core/config';
import { AppConfigService } from '@/core/config/services/app-config.service';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [AppConfigModule],

      inject: [AppConfigService],

      useFactory: (config: AppConfigService) => ({
        connection: {
          host: config.redis.host,
          port: config.redis.port,

          password: config.redis.password || undefined,

          tls: config.redis.tls ? {} : undefined,

          db: config.queue.db,
        },

        prefix: config.queue.prefix,

        defaultJobOptions: config.queue.defaultJobOptions,
      }),
    }),
  ],

  exports: [BullModule],
})
export class BullmqModule {}
