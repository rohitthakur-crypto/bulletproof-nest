import type { WorkspaceMember } from '@prisma/client';

import type { AuthenticatedRequest } from '@/modules/user-auth/interfaces';

export interface WorkspaceRequest extends AuthenticatedRequest {
  workspaceId: string;
  workspaceMember: WorkspaceMember;
}
