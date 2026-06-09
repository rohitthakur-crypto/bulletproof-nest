import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateWorkspaceSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(255).optional(),
    logo: z.string().trim().url('Invalid logo URL').nullable().optional(),
  })
  .strict();

export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;

export class UpdateWorkspaceDto extends createZodDto(updateWorkspaceSchema) {}
