import { Module, forwardRef } from '@nestjs/common';

import { MetaCacheService } from './cache/meta.cache.service';
import { MetaController, MetaWebhookController } from './controllers';
import { FacebookHandler } from './handlers/facebook.handler';
import { InstagramHandler } from './handlers/instagram.handler';
import { WhatsappHandler } from './handlers/whatsapp.handler';
import { MetaConnectService } from './services/meta-connect.service';
import { MetaWebhookService } from './services/meta-webhook.service';
import { MetaService } from './services/meta.service';

import { CacheModule } from '@/core/cache';
import { AppLoggerModule } from '@/core/logger';
import { EncryptionModule } from '@/core/security/encryption';
import { HttpModule } from '@/infra/http';
import { AutomationJobModule } from '@/jobs/automation/automation-jobs.module';
import { SocialAccountsModule } from '@/modules/social-accounts';
import { UserAuthModule } from '@/modules/user-auth';
import { WorkspaceModule } from '@/modules/workspaces';

@Module({
  imports: [
    AppLoggerModule,
    CacheModule,
    HttpModule,
    EncryptionModule,
    UserAuthModule,
    WorkspaceModule,
    AutomationJobModule,
    forwardRef(() => SocialAccountsModule),
  ],
  controllers: [MetaController, MetaWebhookController],
  providers: [
    FacebookHandler,
    InstagramHandler,
    WhatsappHandler,
    MetaService,
    MetaConnectService,
    MetaWebhookService,
    MetaCacheService,
  ],
  exports: [MetaService, MetaConnectService],
})
export class IntegrationsModule {}
