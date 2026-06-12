import { WorkspaceMemberRole } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateWorkspaceMemberSchema = z
  .object({
    role: z.enum(WorkspaceMemberRole),
  })
  .strict();

export type UpdateWorkspaceMemberInput = z.infer<typeof updateWorkspaceMemberSchema>;

export class UpdateWorkspaceMemberDto extends createZodDto(updateWorkspaceMemberSchema) {}
