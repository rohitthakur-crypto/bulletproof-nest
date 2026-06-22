import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { paginationMetaSchema } from '@/common/validators';

export const automationExecutionResponseSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  automationId: z.string().uuid(),
  status: z.enum(['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED']),
  triggerPayload: z.record(z.string(), z.unknown()).nullable(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  error: z.string().optional(),
  executedAt: z.string().datetime(),
});

export type AutomationExecutionResponse = z.infer<typeof automationExecutionResponseSchema>;

export class AutomationExecutionResponseDto extends createZodDto(
  automationExecutionResponseSchema,
) {}

// ─── Paginated list ───────────────────────────────────────────────────────────

export const paginatedExecutionsResponseSchema = z.object({
  items: z.array(automationExecutionResponseSchema),
  pagination: paginationMetaSchema,
});

export type PaginatedExecutionsResponse = z.infer<typeof paginatedExecutionsResponseSchema>;

export class PaginatedExecutionsResponseDto extends createZodDto(
  paginatedExecutionsResponseSchema,
) {}
