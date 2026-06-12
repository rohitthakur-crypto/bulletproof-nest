import { SocialPlatform } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createSocialAccountResponseSchema = z.object({
  id: z.string(),
  platform: z.enum(SocialPlatform),
  externalAccountId: z.string(),
  externalUserId: z.string(),
  accountName: z.string(),
  username: z.string(),
  profilePicture: z.string(),
});

export type CreateSocialAccountResponse = z.infer<typeof createSocialAccountResponseSchema>;

export class CreateSocialAccountResponseDto extends createZodDto(
  createSocialAccountResponseSchema,
) {}
