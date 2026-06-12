import { Injectable } from '@nestjs/common';
import type { Prisma, SocialCredential } from '@prisma/client';

import { BasePrismaRepository, PrismaService } from '@/infra/prisma';

@Injectable()
export class SocialCredentialsRepository extends BasePrismaRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findBySocialAccountId(socialAccountId: string): Promise<SocialCredential | null> {
    return this.db.socialCredential.findUnique({ where: { socialAccountId } });
  }

  async create(data: Prisma.SocialCredentialCreateInput): Promise<SocialCredential> {
    return this.db.socialCredential.create({ data });
  }

  async updateBySocialAccountId(
    socialAccountId: string,
    data: Prisma.SocialCredentialUpdateInput,
  ): Promise<SocialCredential> {
    return this.db.socialCredential.update({
      where: { socialAccountId },
      data,
    });
  }

  async deleteBySocialAccountId(socialAccountId: string): Promise<void> {
    await this.db.socialCredential.delete({ where: { socialAccountId } });
  }
}
