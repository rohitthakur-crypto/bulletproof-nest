import { Injectable } from '@nestjs/common';
import { type Prisma, type UserVerificationToken, VerificationTokenType } from '@prisma/client';

import { BasePrismaRepository, PrismaService } from '@/infra/prisma';

type FindFirstArgs = Pick<Prisma.UserVerificationTokenFindFirstArgs, 'select' | 'include'>;

@Injectable()
export class UserVerificationTokenRepository extends BasePrismaRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string, args?: FindFirstArgs): Promise<UserVerificationToken | null> {
    return this.db.userVerificationToken.findUnique({
      where: { id },
      ...args,
    });
  }

  async findActiveByTokenHash(
    tokenHash: string,
    type: VerificationTokenType,
    args?: FindFirstArgs,
  ): Promise<UserVerificationToken | null> {
    return this.db.userVerificationToken.findFirst({
      where: {
        tokenHash,
        type,
        ...activeTokenWhere(),
      },
      orderBy: { createdAt: 'desc' },
      ...args,
    });
  }

  async findActiveByUserId(
    userId: string,
    type: VerificationTokenType,
    args?: FindFirstArgs,
  ): Promise<UserVerificationToken | null> {
    return this.db.userVerificationToken.findFirst({
      where: {
        userId,
        type,
        ...activeTokenWhere(),
      },
      orderBy: { createdAt: 'desc' },
      ...args,
    });
  }

  async create(
    data: Prisma.UserVerificationTokenCreateInput,
    args?: FindFirstArgs,
  ): Promise<UserVerificationToken> {
    return this.db.userVerificationToken.create({ data, ...args });
  }

  async update(
    id: string,
    data: Prisma.UserVerificationTokenUpdateInput,
    args?: FindFirstArgs,
  ): Promise<UserVerificationToken> {
    return this.db.userVerificationToken.update({
      where: { id },
      data,
      ...args,
    });
  }

  async markUsed(id: string): Promise<UserVerificationToken> {
    return this.update(id, { usedAt: new Date() });
  }

  async invalidateAllForUser(userId: string, type: VerificationTokenType): Promise<number> {
    const result = await this.db.userVerificationToken.updateMany({
      where: { userId, type, usedAt: null },
      data: { usedAt: new Date() },
    });

    return result.count;
  }

  async deleteExpired(before: Date): Promise<number> {
    const result = await this.db.userVerificationToken.deleteMany({
      where: { expiresAt: { lt: before } },
    });

    return result.count;
  }
}

function activeTokenWhere(): Pick<Prisma.UserVerificationTokenWhereInput, 'usedAt' | 'expiresAt'> {
  return {
    usedAt: null,
    expiresAt: { gt: new Date() },
  };
}
