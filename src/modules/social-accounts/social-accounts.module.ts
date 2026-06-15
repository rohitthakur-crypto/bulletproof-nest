import { Module } from '@nestjs/common';

import { UserAuthModule } from '../user-auth/user-auth.module';
import { WorkspaceModule } from '../workspaces';

import { SocialAccountCacheService } from './cache';
import { MetaOauthController, SocialAccountsController } from './controllers';
import { SocialAccountsRepository, SocialCredentialsRepository } from './repositories';
import { MetaService, SocialAccountsService } from './services';

import { EncryptionModule } from '@/core/security/encryption';

@Module({
  imports: [UserAuthModule, WorkspaceModule, EncryptionModule],
  controllers: [MetaOauthController, SocialAccountsController],
  providers: [
    MetaService,
    SocialAccountsService,
    SocialAccountCacheService,
    SocialAccountsRepository,
    SocialCredentialsRepository,
  ],
  exports: [],
})
export class SocialAccountsModule {}
