import type { Workspace } from '@prisma/client';

import type { WorkspaceResponse } from '../dto/workspace-response.dto';

import { toIsoString } from '@/common/utils';

export function toWorkspaceResponse(workspace: Workspace): WorkspaceResponse {
  return {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    logo: workspace.logo ?? undefined,
    createdAt: toIsoString(workspace.createdAt)!,
    updatedAt: toIsoString(workspace.updatedAt)!,
  };
}
