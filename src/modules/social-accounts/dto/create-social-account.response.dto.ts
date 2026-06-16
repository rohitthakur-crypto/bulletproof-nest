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
  webhookSubscribed: z.boolean(),
  created: z.boolean(),
});

export type CreateSocialAccountResponse = z.infer<typeof createSocialAccountResponseSchema>;

export class CreateSocialAccountResponseDto extends createZodDto(
  createSocialAccountResponseSchema,
) {}

export const createSocialAccountFailureSchema = z.object({
  pageId: z.string(),
  reason: z.string(),
  message: z.string(),
});

export type CreateSocialAccountFailure = z.infer<typeof createSocialAccountFailureSchema>;

export class CreateSocialAccountFailureDto extends createZodDto(createSocialAccountFailureSchema) {}

export const createSocialAccountsConnectResponseSchema = z.object({
  connected: z.array(createSocialAccountResponseSchema),
  failed: z.array(createSocialAccountFailureSchema),
});

export type CreateSocialAccountsConnectResponse = z.infer<
  typeof createSocialAccountsConnectResponseSchema
>;

export class CreateSocialAccountsConnectResponseDto extends createZodDto(
  createSocialAccountsConnectResponseSchema,
) {}

export const createSocialAccountsResponseSchema = createSocialAccountsConnectResponseSchema;

export type CreateSocialAccountsResponse = CreateSocialAccountsConnectResponse;

export class CreateSocialAccountsResponseDto extends createZodDto(
  createSocialAccountsConnectResponseSchema,
) {}
