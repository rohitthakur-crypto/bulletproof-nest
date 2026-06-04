import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { AuthActorType } from '@/common/enums';
import {
  JwtSignerService,
  JwtVerifierService,
  TokenType,
  type AccessTokenPayload,
  type EmailVerificationPayload,
  type PasswordResetPayload,
  type RefreshTokenPayload,
} from '@/core/jwt';

@Injectable()
export class UserTokenService {
  constructor(
    private readonly jwtSignerService: JwtSignerService,
    private readonly jwtVerifierService: JwtVerifierService,
  ) {}

  public async generateTokenPair(
    userId: string,
    sessionId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessPayload: AccessTokenPayload = {
      sub: userId,
      sessionId: sessionId,
      actorType: AuthActorType.USER,
      type: TokenType.ACCESS,
      jti: uuidv4(),
    };

    const refreshPayload: RefreshTokenPayload = {
      sub: userId,
      sessionId: sessionId,
      actorType: AuthActorType.USER,
      type: TokenType.REFRESH,
      jti: uuidv4(),
    };
    return {
      accessToken: await this.jwtSignerService.sign(
        accessPayload,
        AuthActorType.USER,
        TokenType.ACCESS,
      ),
      refreshToken: await this.jwtSignerService.sign(
        refreshPayload,
        AuthActorType.USER,
        TokenType.REFRESH,
      ),
    };
  }

  public async generatePasswordResetToken(payload: PasswordResetPayload): Promise<string> {
    return this.jwtSignerService.sign(payload, AuthActorType.USER, TokenType.PASSWORD_RESET);
  }
  public async generateEmailVerificationToken(payload: EmailVerificationPayload): Promise<string> {
    return this.jwtSignerService.sign(payload, AuthActorType.USER, TokenType.EMAIL_VERIFICATION);
  }
  public async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    return this.jwtVerifierService.verify(token, AuthActorType.USER, TokenType.ACCESS);
  }
  public async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    return this.jwtVerifierService.verify(token, AuthActorType.USER, TokenType.REFRESH);
  }
  public async verifyPasswordResetToken(token: string): Promise<PasswordResetPayload> {
    return this.jwtVerifierService.verify(token, AuthActorType.USER, TokenType.PASSWORD_RESET);
  }
  public async verifyEmailVerificationToken(token: string): Promise<EmailVerificationPayload> {
    return this.jwtVerifierService.verify(token, AuthActorType.USER, TokenType.EMAIL_VERIFICATION);
  }
}
