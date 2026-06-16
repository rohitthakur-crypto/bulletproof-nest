import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const metaOAuthCallbackQuerySchema = z
  .object({
    state: z.string().min(1),
    code: z.string().min(1).optional(),
    error: z.string().optional(),
    error_reason: z.string().optional(),
    error_description: z.string().optional(),
  })
  .strict()
  .refine((data) => data.code ?? data.error, {
    message: 'Either code or error must be present',
  });

export type MetaOAuthCallbackQuery = z.infer<typeof metaOAuthCallbackQuerySchema>;

export class MetaOAuthCallbackQueryDto extends createZodDto(metaOAuthCallbackQuerySchema) {}
