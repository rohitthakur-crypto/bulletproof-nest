import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),

  email: z
    .string()
    .email('Invalid email address')
    .transform((v) => v.toLowerCase().trim()),

  avatar: z.string().url('Invalid avatar URL').optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export class CreateUserDto extends createZodDto(createUserSchema) {}
