import { Injectable } from '@nestjs/common';
import type { Prisma, UserPasswordResetToken } from '@prisma/client';

import { BasePrismaRepository, PrismaService } from '@/infra/prisma';

@Injectable()
export class UserPasswordResetRepository extends BasePrismaRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByTokenHash(tokenHash: string): Promise<UserPasswordResetToken | null> {
    return this.db.userPasswordResetToken.findFirst({
      where: { tokenHash, usedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActiveByUserId(userId: string): Promise<UserPasswordResetToken | null> {
    return this.db.userPasswordResetToken.findFirst({
      where: {
        userId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: Prisma.UserPasswordResetTokenCreateInput): Promise<UserPasswordResetToken> {
    return this.db.userPasswordResetToken.create({ data });
  }

  async markUsed(id: string): Promise<UserPasswordResetToken> {
    return this.db.userPasswordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async invalidateAllForUser(userId: string): Promise<number> {
    const result = await this.db.userPasswordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });
    return result.count;
  }
}
