import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RefreshTokenStatus, type UserRefreshToken } from '@prisma/client';

import type { SaveRefreshTokenInput } from '../interfaces';
import { UserRefreshTokenRepository } from '../repositories/user-refresh-token.repository';

import { UserSessionService } from './user-session.service';
import { UserTokenService } from './user-token.service';

import { hashToken, isExpired } from '@/common/utils';
import type { RefreshTokenPayload } from '@/core/jwt';

@Injectable()
export class UserRefreshTokenService {
  constructor(
    private readonly refreshTokenRepository: UserRefreshTokenRepository,
    private readonly userTokenService: UserTokenService,
    private readonly userSessionService: UserSessionService,
  ) {}

  async save(input: SaveRefreshTokenInput): Promise<UserRefreshToken | null> {
    return this.refreshTokenRepository.create(input);
  }

  async verify(token: string): Promise<{ payload: RefreshTokenPayload; record: UserRefreshToken }> {
    const resolved = await this.resolveToken(token);

    if (resolved.record.status !== RefreshTokenStatus.ACTIVE) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return resolved;
  }

  async consume(
    token: string,
  ): Promise<{ payload: RefreshTokenPayload; record: UserRefreshToken }> {
    const resolved = await this.resolveToken(token);

    const { payload, record } = resolved;

    if (record.status === RefreshTokenStatus.USED) {
      await this.handleReuseDetected(record);
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    if (record.status !== RefreshTokenStatus.ACTIVE) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.userSessionService.verifySession(record.sessionId);

    await this.refreshTokenRepository.markAsUsed(record.jti);

    return { payload, record };
  }

  findActiveBySessionId(sessionId: string): Promise<UserRefreshToken | null> {
    return this.refreshTokenRepository.findActiveBySessionId(sessionId);
  }

  revoke(jti: string): Promise<UserRefreshToken> {
    return this.refreshTokenRepository.revokeByJti(jti);
  }

  revokeAllForSession(sessionId: string): Promise<number> {
    return this.refreshTokenRepository.revokeAllForSession(sessionId);
  }

  revokeAllForUser(userId: string): Promise<number> {
    return this.refreshTokenRepository.revokeAllForUser(userId);
  }

  private async resolveToken(
    token: string,
  ): Promise<{ payload: RefreshTokenPayload; record: UserRefreshToken }> {
    const payload = await this.userTokenService.verifyRefreshToken(token);
    const record = await this.refreshTokenRepository.findByJti(payload.jti);

    if (!record) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (hashToken(token) !== record.tokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (isExpired(record.expiresAt)) {
      throw new UnauthorizedException('Refresh token expired');
    }

    return { payload, record };
  }

  private async handleReuseDetected(record: UserRefreshToken): Promise<void> {
    await this.refreshTokenRepository.revokeAllInFamily(record.tokenFamily);
    await this.userSessionService.revoke(record.sessionId);
  }
}
