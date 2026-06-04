import { forwardRef, Module } from '@nestjs/common';

import { UserAuthController } from './controllers/user-auth.controller';
import {
  UserCredentialRepository,
  UserOAuthAccountRepository,
  UserOtpRepository,
  UserPasswordResetRepository,
  UserRefreshTokenRepository,
  UserSessionRepository,
} from './repositories';
import { UserAuthService } from './services/user-auth.service';
import { UserTokenService } from './services/user-token.service';

import { JwtModule as CoreJwtModule } from '@/core/jwt';
import { UsersModule } from '@/modules/users';

@Module({
  imports: [forwardRef(() => UsersModule), CoreJwtModule],
  controllers: [UserAuthController],
  providers: [
    UserAuthService,
    UserTokenService,
    UserCredentialRepository,
    UserOAuthAccountRepository,
    UserSessionRepository,
    UserRefreshTokenRepository,
    UserOtpRepository,
    UserPasswordResetRepository,
  ],
  exports: [UserAuthService],
})
export class UserAuthModule {}
