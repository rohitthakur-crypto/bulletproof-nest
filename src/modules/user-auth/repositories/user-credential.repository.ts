import { Injectable } from '@nestjs/common';
import type { UserCredential } from '@prisma/client';

import { BasePrismaRepository, PrismaService } from '@/infra/prisma';

@Injectable()
export class UserCredentialRepository extends BasePrismaRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByUserId(userId: string): Promise<UserCredential | null> {
    return this.db.userCredential.findUnique({ where: { userId } });
  }

  async create(userId: string, passwordHash: string): Promise<UserCredential> {
    return this.db.userCredential.create({
      data: {
        userId,
        passwordHash,
        passwordChangedAt: new Date(),
      },
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<UserCredential> {
    return this.db.userCredential.update({
      where: { userId },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
      },
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.db.userCredential.delete({ where: { userId } });
  }
}
