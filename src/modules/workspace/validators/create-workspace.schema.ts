import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createWorkspaceSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(255),
    logo: z.string().trim().url('Invalid logo URL').optional(),
  })
  .strict();

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export class CreateWorkspaceDto extends createZodDto(createWorkspaceSchema) {}
