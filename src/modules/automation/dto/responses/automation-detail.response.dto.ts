import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { automationResponseSchema } from './automation.response.dto';

export const automationDetailResponseSchema = automationResponseSchema.extend({
  triggerConfig: z.record(z.string(), z.unknown()),
  flowData: z
    .object({
      nodes: z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          config: z.record(z.string(), z.unknown()),
          nextNodeId: z.string().optional(),
        }),
      ),
      version: z.string().optional(),
    })
    .nullable(),
});

export type AutomationDetailResponse = z.infer<typeof automationDetailResponseSchema>;

export class AutomationDetailResponseDto extends createZodDto(automationDetailResponseSchema) {}
