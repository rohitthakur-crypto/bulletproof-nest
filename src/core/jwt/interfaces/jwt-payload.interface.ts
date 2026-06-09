import { TokenType } from '../enums/token.enum';

import { AuthActorType } from '@/common/enums';

export interface BaseTokenPayload {
  sub: string;

  jti: string;

  actorType: AuthActorType;

  type: TokenType;
}

export interface SessionTokenPayload extends BaseTokenPayload {
  sessionId: string;
  workspaceId?: string;
}

export interface AccessTokenPayload extends SessionTokenPayload {
  type: TokenType.ACCESS;
}

export interface RefreshTokenPayload extends SessionTokenPayload {
  type: TokenType.REFRESH;
}

export interface PasswordResetPayload extends BaseTokenPayload {
  type: TokenType.PASSWORD_RESET;
}

export interface EmailVerificationPayload extends BaseTokenPayload {
  type: TokenType.EMAIL_VERIFICATION;
}

export type TokenPayload =
  | AccessTokenPayload
  | RefreshTokenPayload
  | PasswordResetPayload
  | EmailVerificationPayload
  | SessionTokenPayload;
