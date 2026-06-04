import { Injectable } from '@nestjs/common';
import { SessionStatus, type Prisma, type UserSession } from '@prisma/client';

import type { CreateSessionInput } from '../interfaces';
import { UserSessionRepository } from '../repositories/user-session.repository';

@Injectable()
export class UserSessionService {
  constructor(private readonly userSessionRepository: UserSessionRepository) {}

  upsertForDevice(input: CreateSessionInput): Promise<UserSession> {
    const now = new Date();
    const deviceData = this.toDeviceData(input);

    return this.userSessionRepository.upsertByUserAndDevice(
      input.userId,
      input.deviceId,
      {
        user: { connect: { id: input.userId } },
        ...deviceData,
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
  }

  findById(id: string): Promise<UserSession | null> {
    return this.userSessionRepository.findById(id);
  }

  findByUserIdAndDeviceId(userId: string, deviceId: string): Promise<UserSession | null> {
    return this.userSessionRepository.findByUserIdAndDeviceId(userId, deviceId);
  }

  findManyByUserId(userId: string): Promise<UserSession[]> {
    return this.userSessionRepository.findManyByUserId(userId);
  }

  update(id: string, data: Prisma.UserSessionUpdateInput): Promise<UserSession> {
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
