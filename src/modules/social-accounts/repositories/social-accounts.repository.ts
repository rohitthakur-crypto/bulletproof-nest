import { Injectable } from '@nestjs/common';
import type { Prisma, SocialAccount } from '@prisma/client';

import { BasePrismaRepository, PrismaService } from '@/infra/prisma';

@Injectable()
export class SocialAccountsRepository extends BasePrismaRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<SocialAccount | null> {
    return this.db.socialAccount.findUnique({ where: { id } });
  }

  async create(data: Prisma.SocialAccountCreateInput): Promise<SocialAccount> {
    return this.db.socialAccount.create({ data });
  }

  async update(id: string, data: Prisma.SocialAccountUpdateInput): Promise<SocialAccount> {
    return this.db.socialAccount.update({ where: { id }, data });
  }

  async delete(id: string): Promise<SocialAccount> {
    return this.db.socialAccount.delete({ where: { id } });
  }
}
