import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

import { TimeoutInterceptor } from '@/common/interceptors';
import { RequestLoggerMiddleware } from '@/common/middleware';
import { AppConfigModule } from '@/config/config.module';
import { CacheModule } from '@/core/cache';
import { AppLoggerModule } from '@/core/logger';
import { LOG_EXCLUDED_ROUTES } from '@/core/logger/logger.constants';
import { PrismaModule } from '@/infra/prisma';
import { HealthModule } from '@/modules/health';
import { UserAuthModule } from '@/modules/user-auth';
import { UsersModule } from '@/modules/users';

@Module({
  imports: [
    AppConfigModule,
    AppLoggerModule,
    PrismaModule,
    CacheModule,
    HealthModule,
    UserAuthModule,
    UsersModule,
  ],
  providers: [RequestLoggerMiddleware, TimeoutInterceptor],
  controllers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RequestLoggerMiddleware)
      .exclude(
        ...LOG_EXCLUDED_ROUTES.map((route) => ({
          path: route.path,
          method: RequestMethod.ALL,
        })),
      )
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
