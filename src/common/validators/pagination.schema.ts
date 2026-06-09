import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '@/common/constants';

export const paginationQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
    limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
    search: z.string().optional(),
  })
  .strict();

export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;

export class PaginationQueryDto extends createZodDto(paginationQuerySchema) {}
