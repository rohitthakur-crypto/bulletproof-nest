import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const loginSchema = z
  .object({
    email: z
      .string()
      .email('Invalid email address')
      .transform((value) => value.toLowerCase().trim()),

    password: z.string().min(1, 'Password is required'),
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;

export class LoginDto extends createZodDto(loginSchema) {}
