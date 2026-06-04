import { DevicePlatform } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { passwordSchema } from '@/common/validation';

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),

    email: z
      .string()
      .email('Invalid email address')
      .transform((value) => value.toLowerCase().trim()),

    password: passwordSchema,

    confirmPassword: z.string().trim().min(1, 'Confirm password is required'),

    deviceId: z.string().trim().min(1, 'Device ID is required'),

    platform: z.nativeEnum(DevicePlatform).default(DevicePlatform.WEB),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;

export class RegisterDto extends createZodDto(registerSchema) {}
