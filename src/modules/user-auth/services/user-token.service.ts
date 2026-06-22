import { Injectable } from '@nestjs/common';

import { AuthActorType } from '@/common/enums';
import { TokenType } from '@/core/jwt/enums/token.enum';
import type {
  AccessTokenPayload,
  EmailVerificationPayload,
  PasswordResetPayload,
  RefreshTokenPayload,
} from '@/core/jwt/interfaces/jwt-payload.interface';
import { JwtSignerService } from '@/core/jwt/services/jwt-signer.service';
import { JwtVerifierService } from '@/core/jwt/services/jwt-verifier.service';

@Injectable()
export class UserTokenService {
  constructor(
    private readonly jwtSignerService: JwtSignerService,
    private readonly jwtVerifierService: JwtVerifierService,
  ) {}

  signAccessToken(payload: AccessTokenPayload): Promise<string> {
    return this.jwtSignerService.sign(payload, AuthActorType.USER, TokenType.ACCESS);
  }

  signRefreshToken(payload: RefreshTokenPayload): Promise<string> {
    return this.jwtSignerService.sign(payload, AuthActorType.USER, TokenType.REFRESH);
  }

  signPasswordResetToken(payload: PasswordResetPayload): Promise<string> {
    return this.jwtSignerService.sign(payload, AuthActorType.USER, TokenType.PASSWORD_RESET);
  }

  signEmailVerificationToken(payload: EmailVerificationPayload): Promise<string> {
    return this.jwtSignerService.sign(payload, AuthActorType.USER, TokenType.EMAIL_VERIFICATION);
  }

  verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    return this.jwtVerifierService.verify(token, AuthActorType.USER, TokenType.ACCESS);
  }

  verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    return this.jwtVerifierService.verify(token, AuthActorType.USER, TokenType.REFRESH);
  }

  verifyPasswordResetToken(token: string): Promise<PasswordResetPayload> {
    return this.jwtVerifierService.verify(token, AuthActorType.USER, TokenType.PASSWORD_RESET);
  }

  verifyEmailVerificationToken(token: string): Promise<EmailVerificationPayload> {
    return this.jwtVerifierService.verify(token, AuthActorType.USER, TokenType.EMAIL_VERIFICATION);
  }
}
