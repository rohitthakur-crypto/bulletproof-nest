import { SocialAccountStatus, SocialPlatform } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { paginationQuerySchema } from '@/common/validators/pagination.schema';

export const getSocialAccountsQuerySchema = paginationQuerySchema
  .extend({
    platform: z.enum(SocialPlatform).optional(),
    status: z.enum(SocialAccountStatus).optional(),
  })
  .strict();

export type GetSocialAccountsQuery = z.infer<typeof getSocialAccountsQuerySchema>;

export class GetSocialAccountsQueryDto extends createZodDto(getSocialAccountsQuerySchema) {}

export const listSocialAccountsFiltersSchema = getSocialAccountsQuerySchema.extend({
  workspaceId: z.uuid('Invalid workspace ID'),
});

export type ListSocialAccountsFilters = z.infer<typeof listSocialAccountsFiltersSchema>;
