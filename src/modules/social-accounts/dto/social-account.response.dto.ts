import { SocialAccountStatus, SocialPlatform } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

import { paginationMetaSchema } from '@/common/validators/pagination.schema';

const socialAccountMetaPageSchema = z.object({
  id: z.string(),
  name: z.string(),
  pictureUrl: z.string().optional(),
});

const socialAccountMetadataSchema = z.object({
  page: socialAccountMetaPageSchema,
});

export const socialAccountResponseSchema = z.object({
  id: z.string(),
  platform: z.enum(SocialPlatform),
  platformAccountId: z.string(),
  metaPageId: z.string().optional(),
  accountName: z.string(),
  username: z.string().optional(),
  profilePicture: z.string().optional(),
  status: z.enum(SocialAccountStatus),
  webhookSubscribed: z.boolean(),
  webhookSubscribedAt: z.string().optional(),
  webhookFields: z.array(z.string()),
  metadata: socialAccountMetadataSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type SocialAccountResponse = z.infer<typeof socialAccountResponseSchema>;

export class SocialAccountResponseDto extends createZodDto(socialAccountResponseSchema) {}

export const paginatedSocialAccountsResponseSchema = z.object({
  items: z.array(socialAccountResponseSchema),
  pagination: paginationMetaSchema,
});

export type PaginatedSocialAccountsResponse = z.infer<typeof paginatedSocialAccountsResponseSchema>;

export class PaginatedSocialAccountsResponseDto extends createZodDto(
  paginatedSocialAccountsResponseSchema,
) {}
