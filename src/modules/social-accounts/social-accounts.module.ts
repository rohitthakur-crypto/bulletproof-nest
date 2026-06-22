import { Module, forwardRef } from '@nestjs/common';

import { SocialAccountsController } from './controllers';
import { SocialAccountsRepository } from './repositories/social-accounts.repository';
import { SocialCredentialsRepository } from './repositories/social-credentials.repository';
import { SocialAccountsService } from './services/social-accounts.service';

import { EncryptionModule } from '@/core/security/encryption';
import { IntegrationsModule } from '@/modules/integrations';
import { UserAuthModule } from '@/modules/user-auth/user-auth.module';
import { WorkspaceModule } from '@/modules/workspaces';

@Module({
  imports: [
    UserAuthModule,
    WorkspaceModule,
    EncryptionModule,
    forwardRef(() => IntegrationsModule),
  ],
  controllers: [SocialAccountsController],
  providers: [SocialAccountsService, SocialAccountsRepository, SocialCredentialsRepository],
  exports: [SocialAccountsService, SocialAccountsRepository],
})
export class SocialAccountsModule {}
