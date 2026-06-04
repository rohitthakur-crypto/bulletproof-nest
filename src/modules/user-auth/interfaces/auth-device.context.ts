import type { DevicePlatform, DeviceType } from '@prisma/client';

export interface AuthDeviceContext {
  deviceId: string;
  deviceType?: DeviceType;
  platform: DevicePlatform;
  fcmToken?: string;
  deviceName?: string;
  osVersion?: string;
  appVersion?: string;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  region?: string;
  city?: string;
}
