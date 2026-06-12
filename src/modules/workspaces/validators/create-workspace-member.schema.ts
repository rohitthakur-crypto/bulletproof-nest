import { WorkspaceMemberRole } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createWorkspaceMemberSchema = z
  .object({
    userId: z.uuid('Invalid user ID'),
    role: z.enum(WorkspaceMemberRole).default(WorkspaceMemberRole.MEMBER),
  })
  .strict();

export type CreateWorkspaceMemberInput = z.infer<typeof createWorkspaceMemberSchema>;

export class CreateWorkspaceMemberDto extends createZodDto(createWorkspaceMemberSchema) {}
