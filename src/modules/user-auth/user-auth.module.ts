import { forwardRef, Module } from '@nestjs/common';

import { UserSessionCacheService } from './cache/user-session.cache';
import { UserAuthController } from './controllers/user-auth.controller';
import { UserAuthGuard } from './guards/user-auth.guard';
import {
  UserCredentialRepository,
  UserOAuthAccountRepository,
  UserOtpRepository,
  UserVerificationTokenRepository,
  UserRefreshTokenRepository,
  UserSessionRepository,
} from './repositories';
import { UserAuthService } from './services/user-auth.service';
import { UserCredentialService } from './services/user-credential.service';
import { UserRefreshTokenService } from './services/user-refresh-token.service';
import { UserSessionService } from './services/user-session.service';
import { UserTokenService } from './services/user-token.service';

import { JwtModule as CoreJwtModule } from '@/core/jwt';
import { PasswordModule } from '@/core/security/password';
import { UsersModule } from '@/modules/users';
import { WorkspaceModule } from '@/modules/workspace';

@Module({
  imports: [forwardRef(() => UsersModule), WorkspaceModule, CoreJwtModule, PasswordModule],
  controllers: [UserAuthController],
  providers: [
    UserAuthService,
    UserCredentialService,
    UserTokenService,
    UserRefreshTokenService,
    UserSessionService,
    UserSessionCacheService,
    UserCredentialRepository,
    UserOAuthAccountRepository,
    UserSessionRepository,
    UserRefreshTokenRepository,
    UserOtpRepository,
    UserVerificationTokenRepository,
    UserAuthGuard,
  ],
  exports: [UserAuthService, UserAuthGuard, UserSessionService],
})
export class UserAuthModule {}
