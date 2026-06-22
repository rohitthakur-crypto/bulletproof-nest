import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { flowDataSchema, triggerConfigSchema } from './create-automation.schema';

export const updateAutomationSchema = z
  .object({
    name: z.string().min(1).max(255).trim().optional(),
    description: z.string().max(1000).trim().optional(),
    triggerConfig: triggerConfigSchema.optional(),
    flowData: flowDataSchema.optional(),
    isAiEnabled: z.boolean().optional(),
  })
  .strict();

export type UpdateAutomationType = z.infer<typeof updateAutomationSchema>;

export class UpdateAutomationDto extends createZodDto(updateAutomationSchema) {}
