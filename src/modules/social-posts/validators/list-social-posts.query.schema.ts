import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import {
  SOCIAL_POSTS_DEFAULT_LIMIT,
  SOCIAL_POSTS_DEFAULT_PAGE,
  SOCIAL_POSTS_MAX_LIMIT,
} from '../constants';

export const listSocialPostsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(SOCIAL_POSTS_DEFAULT_PAGE),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(SOCIAL_POSTS_MAX_LIMIT)
      .default(SOCIAL_POSTS_DEFAULT_LIMIT),
  })
  .strict();

export type ListSocialPostsQuery = z.infer<typeof listSocialPostsQuerySchema>;

export class ListSocialPostsQueryDto extends createZodDto(listSocialPostsQuerySchema) {}
