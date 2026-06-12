import { Injectable } from '@nestjs/common';

import { JWT_KIDS, type JwtKid } from '../constants/jwt-kids.constant';
import { TokenType } from '../enums/token.enum';
import { JwtKeyPair } from '../interfaces/jwt-key-pair.interface';

import { AuthActorType } from '@/common/enums';
import { AppConfigService } from '@/config';
import type { JwtKeyPairConfig } from '@/config/interfaces';

@Injectable()
export class JwtKeyService {
  constructor(private readonly appConfig: AppConfigService) {}

  getUserAccessKeys(): JwtKeyPair {
    return this.toKeyPair(this.appConfig.jwt.user.access, JWT_KIDS.USER_ACCESS);
  }

  getUserRefreshKeys(): JwtKeyPair {
    return this.toKeyPair(this.appConfig.jwt.user.refresh, JWT_KIDS.USER_REFRESH);
  }

  getUserPasswordResetKeys(): JwtKeyPair {
    return this.toKeyPair(this.appConfig.jwt.user.passwordReset, JWT_KIDS.USER_PASSWORD_RESET);
  }

  getUserEmailVerificationKeys(): JwtKeyPair {
    return this.toKeyPair(
      this.appConfig.jwt.user.emailVerification,
      JWT_KIDS.USER_EMAIL_VERIFICATION,
    );
  }

  getAdminAccessKeys(): JwtKeyPair {
    return this.toKeyPair(this.appConfig.jwt.admin.access, JWT_KIDS.ADMIN_ACCESS);
  }

  getAdminRefreshKeys(): JwtKeyPair {
    return this.toKeyPair(this.appConfig.jwt.admin.refresh, JWT_KIDS.ADMIN_REFRESH);
  }

  getAdminPasswordResetKeys(): JwtKeyPair {
    return this.toKeyPair(this.appConfig.jwt.admin.passwordReset, JWT_KIDS.ADMIN_PASSWORD_RESET);
  }

  getMetaOauthStateKeys(): JwtKeyPair {
    return this.toKeyPair(this.appConfig.jwt.meta.state, JWT_KIDS.META_OAUTH_STATE);
  }

  getKeys(actor: AuthActorType, tokenType: TokenType): JwtKeyPair {
    if (actor === AuthActorType.USER) {
      switch (tokenType) {
        case TokenType.ACCESS:
          return this.getUserAccessKeys();

        case TokenType.REFRESH:
          return this.getUserRefreshKeys();

        case TokenType.PASSWORD_RESET:
          return this.getUserPasswordResetKeys();

        case TokenType.EMAIL_VERIFICATION:
          return this.getUserEmailVerificationKeys();

        case TokenType.META_OAUTH:
          return this.getMetaOauthStateKeys();
      }
    }

    switch (tokenType) {
      case TokenType.ACCESS:
        return this.getAdminAccessKeys();

      case TokenType.REFRESH:
        return this.getAdminRefreshKeys();

      case TokenType.PASSWORD_RESET:
        return this.getAdminPasswordResetKeys();

      default:
        return this.getAdminAccessKeys();
    }
  }

  private toKeyPair(config: JwtKeyPairConfig, kid: JwtKid): JwtKeyPair {
    return {
      privateKey: config.privateKey,
      publicKey: config.publicKey,
      kid,
      expiresIn: config.expiresIn,
    };
  }
}
