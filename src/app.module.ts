import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

import { TimeoutInterceptor } from '@/common/interceptors/timeout.interceptor';
import { RequestLoggerMiddleware } from '@/common/middleware/request-logger.middleware';
import { CacheModule } from '@/core/cache';
import { AppConfigModule } from '@/core/config';
import { AppLoggerModule } from '@/core/logger';
import { LOG_EXCLUDED_ROUTES } from '@/core/logger/logger.constants';
import { BullmqModule } from '@/infra/bullmq';
import { HttpModule } from '@/infra/http';
import { PrismaModule } from '@/infra/prisma';
import { AutomationJobModule } from '@/jobs/automation/automation-jobs.module';
import { AutomationModule } from '@/modules/automation';
import { HealthModule } from '@/modules/health';
import { IntegrationsModule } from '@/modules/integrations';
import { SocialAccountsModule } from '@/modules/social-accounts';
import { SocialPostsModule } from '@/modules/social-posts';
import { UserAuthModule } from '@/modules/user-auth';
import { UsersModule } from '@/modules/users';
import { WorkspaceModule } from '@/modules/workspaces';

@Module({
  imports: [
    AppConfigModule,
    AppLoggerModule,
    PrismaModule,
    HttpModule,
    CacheModule,
    BullmqModule,
    HealthModule,
    UserAuthModule,
    UsersModule,
    WorkspaceModule,
    IntegrationsModule,
    SocialAccountsModule,
    SocialPostsModule,
    AutomationModule,
    AutomationJobModule,
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
