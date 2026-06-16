import { Module } from '@nestjs/common';

import { MetaOAuthCacheService } from './cache';
import { MetaController, MetaWebhookController } from './controllers';
import { MetaConnectService, MetaService, MetaWebhookService } from './services';

import { CacheModule } from '@/core/cache';
import { AppLoggerModule } from '@/core/logger';
import { EncryptionModule } from '@/core/security/encryption';
import { HttpModule } from '@/infra/http';
import { UserAuthModule } from '@/modules/user-auth/user-auth.module';
import { WorkspaceModule } from '@/modules/workspaces';

@Module({
  imports: [
    AppLoggerModule,
    CacheModule,
    HttpModule,
    EncryptionModule,
    UserAuthModule,
    WorkspaceModule,
  ],
  controllers: [MetaController, MetaWebhookController],
  providers: [MetaService, MetaConnectService, MetaWebhookService, MetaOAuthCacheService],
  exports: [MetaService, MetaConnectService],
})
export class IntegrationsModule {}
