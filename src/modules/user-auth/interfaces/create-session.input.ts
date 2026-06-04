import type { DevicePlatform, DeviceType } from '@prisma/client';

export interface CreateSessionInput {
  userId: string;
  deviceId: string;
  deviceName?: string;
  deviceType?: DeviceType;
  platform?: DevicePlatform;
  osVersion?: string;
  appVersion?: string;
  userAgent?: string;
  fcmToken?: string;
  ipAddress?: string;
  country?: string;
  region?: string;
  city?: string;
  expiresAt: Date;
}
