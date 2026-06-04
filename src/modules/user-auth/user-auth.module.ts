import { forwardRef, Module } from '@nestjs/common';

import { UserAuthController } from './controllers/user-auth.controller';
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

@Module({
  imports: [forwardRef(() => UsersModule), CoreJwtModule, PasswordModule],
  controllers: [UserAuthController],
  providers: [
    UserAuthService,
    UserCredentialService,
    UserTokenService,
    UserRefreshTokenService,
    UserSessionService,
    UserCredentialRepository,
    UserOAuthAccountRepository,
    UserSessionRepository,
    UserRefreshTokenRepository,
    UserOtpRepository,
    UserVerificationTokenRepository,
  ],
  exports: [UserAuthService],
})
export class UserAuthModule {}
