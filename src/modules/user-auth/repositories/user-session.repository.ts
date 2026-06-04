import { Injectable } from '@nestjs/common';
import { SessionStatus, type Prisma, type UserSession } from '@prisma/client';

import { BasePrismaRepository, PrismaService } from '@/infra/prisma';

@Injectable()
export class UserSessionRepository extends BasePrismaRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<UserSession | null> {
    return this.db.userSession.findUnique({ where: { id } });
  }

  async findByUserIdAndDeviceId(userId: string, deviceId: string): Promise<UserSession | null> {
    return this.db.userSession.findUnique({
      where: { userId_deviceId: { userId, deviceId } },
    });
  }

  async findManyByUserId(userId: string, status?: SessionStatus): Promise<UserSession[]> {
    return this.db.userSession.findMany({
      where: { userId, ...(status ? { status } : {}) },
      orderBy: { lastActivityAt: 'desc' },
    });
  }

  async create(data: Prisma.UserSessionCreateInput): Promise<UserSession> {
    return this.db.userSession.create({ data });
  }

  async update(id: string, data: Prisma.UserSessionUpdateInput): Promise<UserSession> {
    return this.db.userSession.update({ where: { id }, data });
  }

  async touchActivity(id: string): Promise<UserSession> {
    return this.db.userSession.update({
      where: { id },
      data: { lastActivityAt: new Date() },
    });
  }

  async revoke(id: string): Promise<UserSession> {
    return this.db.userSession.update({
      where: { id },
      data: {
        status: SessionStatus.REVOKED,
        revokedAt: new Date(),
      },
    });
  }

  async revokeAllForUser(userId: string): Promise<number> {
    const result = await this.db.userSession.updateMany({
      where: { userId, status: SessionStatus.ACTIVE },
      data: {
        status: SessionStatus.REVOKED,
        revokedAt: new Date(),
      },
    });
    return result.count;
  }

  async delete(id: string): Promise<void> {
    await this.db.userSession.delete({ where: { id } });
  }
}
