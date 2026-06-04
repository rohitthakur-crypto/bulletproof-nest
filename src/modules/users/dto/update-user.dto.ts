import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateUserSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),

    avatar: z.string().url('Invalid avatar URL').nullable().optional(),
  })
  .strict();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export class UpdateUserDto extends createZodDto(updateUserSchema) {}
