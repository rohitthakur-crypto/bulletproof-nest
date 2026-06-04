import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const userResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatar: z.string().optional(),
  isEmailVerified: z.boolean(),
  lastActiveAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserResponse = z.infer<typeof userResponseSchema>;

export class UserResponseDto extends createZodDto(userResponseSchema) {}
