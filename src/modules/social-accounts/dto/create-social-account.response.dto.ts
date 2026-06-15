import { SocialPlatform } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createSocialAccountResponseSchema = z.object({
  id: z.string(),
  platform: z.enum(SocialPlatform),
  platformAccountId: z.string(),
  accountName: z.string(),
  username: z.string().optional(),
  profilePicture: z.string().optional(),
  created: z.boolean(),
});

export type CreateSocialAccountResponse = z.infer<typeof createSocialAccountResponseSchema>;

export class CreateSocialAccountResponseDto extends createZodDto(
  createSocialAccountResponseSchema,
) {}

export const createSocialAccountsResponseSchema = z.array(createSocialAccountResponseSchema);

export type CreateSocialAccountsResponse = z.infer<typeof createSocialAccountsResponseSchema>;

export class CreateSocialAccountsResponseDto extends createZodDto(
  createSocialAccountsResponseSchema,
) {}
