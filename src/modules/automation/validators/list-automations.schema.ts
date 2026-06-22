import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import {
  AUTOMATION_DEFAULT_LIMIT,
  AUTOMATION_DEFAULT_PAGE,
  AUTOMATION_MAX_LIMIT,
} from '../constants';

export const listAutomationsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(AUTOMATION_DEFAULT_PAGE),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(AUTOMATION_MAX_LIMIT)
      .default(AUTOMATION_DEFAULT_LIMIT),
    search: z.string().trim().optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
    triggerType: z
      .enum([
        'COMMENT_KEYWORD',
        'DM_KEYWORD',
        'STORY_MENTION',
        'WEBHOOK',
        'COMMENT_CREATED',
        'MESSAGE_RECEIVED',
        'MENTION_CREATED',
        'MANUAL',
      ])
      .optional(),
    socialAccountId: z.string().uuid().optional(),
  })
  .strict();

export type ListAutomationsQuery = z.infer<typeof listAutomationsQuerySchema>;

export class ListAutomationsQueryDto extends createZodDto(listAutomationsQuerySchema) {}

// ─── Execution list ───────────────────────────────────────────────────────────

export const listExecutionsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(AUTOMATION_DEFAULT_PAGE),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(AUTOMATION_MAX_LIMIT)
      .default(AUTOMATION_DEFAULT_LIMIT),
    status: z.enum(['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED']).optional(),
  })
  .strict();

export type ListExecutionsQuery = z.infer<typeof listExecutionsQuerySchema>;

export class ListExecutionsQueryDto extends createZodDto(listExecutionsQuerySchema) {}
