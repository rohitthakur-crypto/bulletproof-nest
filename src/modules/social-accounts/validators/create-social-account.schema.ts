import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createSocialAccountSchema = z.object({
  pageId: z.string(),
});

export type CreateSocialAccountSchema = z.infer<typeof createSocialAccountSchema>;

export class CreateSocialAccountDto extends createZodDto(createSocialAccountSchema) {}
