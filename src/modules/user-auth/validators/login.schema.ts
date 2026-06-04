import { DevicePlatform, DeviceType } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const loginSchema = z
  .object({
    email: z
      .string()
      .email('Invalid email address')
      .transform((value) => value.toLowerCase().trim()),

    password: z.string().min(1, 'Password is required'),

    deviceType: z.enum(DeviceType).optional(),

    deviceId: z.string().trim().min(1, 'Device ID is required'),

    platform: z.enum(DevicePlatform).default(DevicePlatform.WEB),

    fcmToken: z.string().trim().min(1, 'FCM token is required').max(4096, 'Invalid FCM token'),
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;

export class LoginDto extends createZodDto(loginSchema) {}
