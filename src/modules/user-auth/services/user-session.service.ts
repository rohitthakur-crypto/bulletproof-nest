import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SessionStatus, type Prisma, type UserSession } from '@prisma/client';

import { UserSessionCacheService } from '../cache/user-session.cache';
import type { CreateSessionInput } from '../interfaces';
import { UserSessionRepository } from '../repositories/user-session.repository';

import { isExpired } from '@/common/utils';

@Injectable()
export class UserSessionService {
  constructor(
    private readonly userSessionRepository: UserSessionRepository,
    private readonly userSessionCache: UserSessionCacheService,
  ) {}

  public async upsertForDevice(input: CreateSessionInput): Promise<UserSession> {
    const now = new Date();
    const deviceData = this.toDeviceData(input);

    const session = await this.userSessionRepository.upsertByUserAndDevice(
      input.userId,
      input.deviceId,
      {
        user: { connect: { id: input.userId } },
        ...deviceData,
        status: SessionStatus.ACTIVE,
        expiresAt: input.expiresAt,
        lastActivityAt: now,
        loginAt: now,
      },
      {
        ...deviceData,
        status: SessionStatus.ACTIVE,
        expiresAt: input.expiresAt,
        lastActivityAt: now,
        loginAt: now,
        revokedAt: null,
      },
    );

    await this.userSessionCache.invalidateById(session.id);

    return session;
  }

  public async findById(id: string): Promise<UserSession | null> {
    return this.userSessionCache.getOrSetById(id, () => this.userSessionRepository.findById(id));
  }

  public async verifySession(sessionId: string): Promise<UserSession> {
    const session = await this.findById(sessionId);

    if (!session || session.status !== SessionStatus.ACTIVE) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (isExpired(new Date(session.expiresAt))) {
      throw new UnauthorizedException('Unauthorized');
    }

    return session;
  }

  public async extendSession(sessionId: string, expiresAt: Date): Promise<UserSession> {
    const session = await this.userSessionRepository.update(sessionId, {
      expiresAt,
      lastActivityAt: new Date(),
    });
    await this.userSessionCache.invalidateById(sessionId);
    return session;
  }

  public findByUserIdAndDeviceId(userId: string, deviceId: string): Promise<UserSession | null> {
    return this.userSessionRepository.findByUserIdAndDeviceId(userId, deviceId);
  }

  public findManyByUserId(userId: string): Promise<UserSession[]> {
    return this.userSessionRepository.findManyByUserId(userId);
  }

  async revoke(id: string): Promise<UserSession> {
    const session = await this.userSessionRepository.revoke(id);
    await this.userSessionCache.invalidateById(id);
    return session;
  }

  public update(id: string, data: Prisma.UserSessionUpdateInput): Promise<UserSession> {
    return this.userSessionRepository.update(id, data);
  }

  private toDeviceData(
    input: CreateSessionInput,
  ): Omit<Prisma.UserSessionCreateInput, 'user' | 'expiresAt' | 'lastActivityAt' | 'loginAt'> {
    return {
      deviceId: input.deviceId,
      deviceName: input.deviceName,
      deviceType: input.deviceType,
      platform: input.platform,
      osVersion: input.osVersion,
      appVersion: input.appVersion,
      userAgent: input.userAgent,
      fcmToken: input.fcmToken,
      ipAddress: input.ipAddress,
      country: input.country,
      region: input.region,
      city: input.city,
    };
  }
}
