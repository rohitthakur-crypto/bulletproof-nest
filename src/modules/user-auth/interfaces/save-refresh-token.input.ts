export interface SaveRefreshTokenInput {
  userId: string;
  sessionId: string;
  jti: string;
  tokenFamily: string;
  expiresAt: Date;
  tokenHash: string;
}
