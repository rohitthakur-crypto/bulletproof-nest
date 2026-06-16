import { Module } from '@nestjs/common';

import { SocialAccountsController } from './controllers';
import { SocialAccountsRepository, SocialCredentialsRepository } from './repositories';
import { SocialAccountsService } from './services';

import { EncryptionModule } from '@/core/security/encryption';
import { IntegrationsModule } from '@/modules/integrations';
import { UserAuthModule } from '@/modules/user-auth/user-auth.module';
import { WorkspaceModule } from '@/modules/workspaces';

@Module({
  imports: [UserAuthModule, WorkspaceModule, EncryptionModule, IntegrationsModule],
  controllers: [SocialAccountsController],
  providers: [SocialAccountsService, SocialAccountsRepository, SocialCredentialsRepository],
  exports: [SocialAccountsRepository],
})
export class SocialAccountsModule {}
