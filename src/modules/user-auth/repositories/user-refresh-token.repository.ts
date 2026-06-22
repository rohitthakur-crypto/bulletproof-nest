import { Injectable } from '@nestjs/common';
import { RefreshTokenStatus, type UserRefreshToken } from '@prisma/client';

import { SaveRefreshTokenInput } from '../interfaces';

import { PrismaService } from '@/infra/prisma/prisma.service';
import { BasePrismaRepository } from '@/infra/prisma/repositories/base.repository';

@Injectable()
export class UserRefreshTokenRepository extends BasePrismaRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<UserRefreshToken | null> {
    return this.db.userRefreshToken.findUnique({ where: { id } });
  }

  async findByJti(jti: string): Promise<UserRefreshToken | null> {
    return this.db.userRefreshToken.findUnique({ where: { jti } });
  }

  async findActiveBySessionId(sessionId: string): Promise<UserRefreshToken | null> {
    return this.db.userRefreshToken.findFirst({
      where: { sessionId, status: RefreshTokenStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: SaveRefreshTokenInput): Promise<UserRefreshToken> {
    return this.db.userRefreshToken.create({ data });
  }

  async updateStatus(id: string, status: RefreshTokenStatus): Promise<UserRefreshToken> {
    return this.db.userRefreshToken.update({
      where: { id },
      data: { status },
    });
  }

  async revokeByJti(jti: string): Promise<UserRefreshToken> {
    return this.db.userRefreshToken.update({
      where: { jti },
      data: { status: RefreshTokenStatus.REVOKED },
    });
  }

  async markAsUsed(jti: string): Promise<UserRefreshToken> {
    return this.db.userRefreshToken.update({
      where: { jti },
      data: { status: RefreshTokenStatus.USED },
    });
  }

  async revokeAllInFamily(tokenFamily: string): Promise<number> {
    const result = await this.db.userRefreshToken.updateMany({
      where: {
        tokenFamily,
        status: { in: [RefreshTokenStatus.ACTIVE, RefreshTokenStatus.USED] },
      },
      data: { status: RefreshTokenStatus.REVOKED },
    });
    return result.count;
  }

  async revokeAllForSession(sessionId: string): Promise<number> {
    const result = await this.db.userRefreshToken.updateMany({
      where: { sessionId, status: RefreshTokenStatus.ACTIVE },
      data: { status: RefreshTokenStatus.REVOKED },
    });
    return result.count;
  }

  async revokeAllForUser(userId: string): Promise<number> {
    const result = await this.db.userRefreshToken.updateMany({
      where: { userId, status: RefreshTokenStatus.ACTIVE },
      data: { status: RefreshTokenStatus.REVOKED },
    });
    return result.count;
  }
}
