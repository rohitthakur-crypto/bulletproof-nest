import { SetMetadata } from '@nestjs/common';
import type { WorkspaceMemberRole } from '@prisma/client';

import { WORKSPACE_ROLES_KEY } from '../constants/workspace-roles.constant';

export const WorkspaceRoles = (...roles: WorkspaceMemberRole[]) =>
  SetMetadata(WORKSPACE_ROLES_KEY, roles);
