import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RefreshTokenStatus, type UserRefreshToken } from '@prisma/client';

import type { SaveRefreshTokenInput } from '../interfaces';
import { UserRefreshTokenRepository } from '../repositories/user-refresh-token.repository';

import { UserTokenService } from './user-token.service';

import { hashToken } from '@/common/utils';
import type { RefreshTokenPayload } from '@/core/jwt';

@Injectable()
export class UserRefreshTokenService {
  constructor(
    private readonly refreshTokenRepository: UserRefreshTokenRepository,
    private readonly userTokenService: UserTokenService,
  ) {}

  async save(input: SaveRefreshTokenInput): Promise<UserRefreshToken | null> {
    return this.refreshTokenRepository.create(input);
  }

  async verify(token: string): Promise<{ payload: RefreshTokenPayload; record: UserRefreshToken }> {
    const payload = await this.userTokenService.verifyRefreshToken(token);
    const record = await this.refreshTokenRepository.findByJti(payload.jti);

    if (!record || record.status !== RefreshTokenStatus.ACTIVE) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (hashToken(token) !== record.tokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

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
}
