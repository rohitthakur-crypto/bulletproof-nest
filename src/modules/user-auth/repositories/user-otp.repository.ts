import { Injectable } from '@nestjs/common';
import type { Prisma, UserOtpCode, OtpType } from '@prisma/client';

import { PrismaService } from '@/infra/prisma/prisma.service';
import { BasePrismaRepository } from '@/infra/prisma/repositories/base.repository';

@Injectable()
export class UserOtpRepository extends BasePrismaRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findLatestByEmailAndType(email: string, type: OtpType): Promise<UserOtpCode | null> {
    return this.db.userOtpCode.findFirst({
      where: { email, type, verifiedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: Prisma.UserOtpCodeCreateInput): Promise<UserOtpCode> {
    return this.db.userOtpCode.create({ data });
  }

  async markVerified(id: string): Promise<UserOtpCode> {
    return this.db.userOtpCode.update({
      where: { id },
      data: { verifiedAt: new Date() },
    });
  }

  async deleteExpired(before: Date): Promise<number> {
    const result = await this.db.userOtpCode.deleteMany({
      where: {
        expiresAt: { lt: before },
      },
    });
    return result.count;
  }
}
