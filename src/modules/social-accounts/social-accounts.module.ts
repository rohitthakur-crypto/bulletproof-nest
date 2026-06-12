import { Module } from '@nestjs/common';

import { UserAuthModule } from '../user-auth/user-auth.module';
import { WorkspaceModule } from '../workspaces';

import { SocialAccountCacheService } from './cache';
import { MetaOauthController } from './controllers';
import { SocialAccountsRepository } from './repositories';
import { MetaService, SocialAccountsService } from './services';

import { EncryptionModule } from '@/core/security/encryption';

@Module({
  imports: [UserAuthModule, WorkspaceModule, EncryptionModule],
  controllers: [MetaOauthController],
  providers: [
    MetaService,
    SocialAccountsService,
    SocialAccountCacheService,
    SocialAccountsRepository,
  ],
  exports: [],
})
export class SocialAccountsModule {}
