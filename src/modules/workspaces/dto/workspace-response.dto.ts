import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const workspaceResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type WorkspaceResponse = z.infer<typeof workspaceResponseSchema>;

export class WorkspaceResponseDto extends createZodDto(workspaceResponseSchema) {}
