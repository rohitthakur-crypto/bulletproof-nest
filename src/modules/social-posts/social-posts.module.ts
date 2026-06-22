import { Module } from '@nestjs/common';

import { SocialPostsController } from './controllers';
import { FacebookPostProvider } from './providers/facebook-post.provider';
import { InstagramPostProvider } from './providers/instagram-post.provider';
import { SocialPostSyncStateRepository } from './repositories/social-post-sync-state.repository';
import { SocialPostRepository } from './repositories/social-post.repository';
import { SocialPostsService } from './services/social-posts.service';

import { EncryptionModule } from '@/core/security/encryption';
import { HttpModule } from '@/infra/http';
import { SocialAccountsRepository } from '@/modules/social-accounts/repositories/social-accounts.repository';
import { SocialCredentialsRepository } from '@/modules/social-accounts/repositories/social-credentials.repository';
import { UserAuthModule } from '@/modules/user-auth';
import { WorkspaceModule } from '@/modules/workspaces';

@Module({
  imports: [UserAuthModule, WorkspaceModule, EncryptionModule, HttpModule],
  controllers: [SocialPostsController],
  providers: [
    SocialPostsService,
    SocialPostRepository,
    SocialPostSyncStateRepository,
    SocialAccountsRepository,
    SocialCredentialsRepository,
    FacebookPostProvider,
    InstagramPostProvider,
  ],
  exports: [SocialPostsService],
})
export class SocialPostsModule {}
