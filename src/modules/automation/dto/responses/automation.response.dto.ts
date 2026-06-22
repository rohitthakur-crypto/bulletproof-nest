import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { paginationMetaSchema } from '@/common/validators';

// ─── Single automation (list item) ───────────────────────────────────────────

export const automationResponseSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  socialAccountId: z.string().uuid(),
  createdById: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED']),
  triggerType: z.enum([
    'COMMENT_KEYWORD',
    'DM_KEYWORD',
    'STORY_MENTION',
    'WEBHOOK',
    'COMMENT_CREATED',
    'MESSAGE_RECEIVED',
    'MENTION_CREATED',
    'MANUAL',
  ]),
  isAiEnabled: z.boolean(),
  publishedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AutomationResponse = z.infer<typeof automationResponseSchema>;

export class AutomationResponseDto extends createZodDto(automationResponseSchema) {}

// ─── Paginated list ───────────────────────────────────────────────────────────

export const paginatedAutomationsResponseSchema = z.object({
  items: z.array(automationResponseSchema),
  pagination: paginationMetaSchema,
});

export type PaginatedAutomationsResponse = z.infer<typeof paginatedAutomationsResponseSchema>;

export class PaginatedAutomationsResponseDto extends createZodDto(
  paginatedAutomationsResponseSchema,
) {}
