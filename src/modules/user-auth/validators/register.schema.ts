import { DevicePlatform, DeviceType } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { passwordSchema } from '@/common/validators';

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),

    email: z.email('Invalid email address').transform((value) => value.toLowerCase().trim()),

    password: passwordSchema,

    confirmPassword: z.string().trim().min(1, 'Confirm password is required'),

    deviceType: z.enum(DeviceType).optional(),

    deviceId: z.string().trim().min(1, 'Device ID is required'),

    platform: z.enum(DevicePlatform).default(DevicePlatform.WEB),

    fcmToken: z.string().trim().min(1, 'FCM token is required').max(4096, 'Invalid FCM token'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;

export class RegisterDto extends createZodDto(registerSchema) {}
