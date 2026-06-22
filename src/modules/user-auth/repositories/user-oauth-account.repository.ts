import { Injectable } from '@nestjs/common';
import { AuthProvider, type Prisma, type UserAuthProviderAccount } from '@prisma/client';

import { PrismaService } from '@/infra/prisma/prisma.service';
import { BasePrismaRepository } from '@/infra/prisma/repositories/base.repository';

@Injectable()
export class UserOAuthAccountRepository extends BasePrismaRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByProviderAndProviderId(
    provider: AuthProvider,
    providerId: string,
  ): Promise<UserAuthProviderAccount | null> {
    return this.db.userAuthProviderAccount.findUnique({
      where: { provider_providerId: { provider, providerId } },
    });
  }

  async findByUserIdAndProvider(
    userId: string,
    provider: AuthProvider,
  ): Promise<UserAuthProviderAccount | null> {
    return this.db.userAuthProviderAccount.findFirst({
      where: { userId, provider },
    });
  }

  async findManyByUserId(userId: string): Promise<UserAuthProviderAccount[]> {
    return this.db.userAuthProviderAccount.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(data: Prisma.UserAuthProviderAccountCreateInput): Promise<UserAuthProviderAccount> {
    return this.db.userAuthProviderAccount.create({ data });
  }

  async update(
    id: string,
    data: Prisma.UserAuthProviderAccountUpdateInput,
  ): Promise<UserAuthProviderAccount> {
    return this.db.userAuthProviderAccount.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.db.userAuthProviderAccount.delete({ where: { id } });
  }
}
