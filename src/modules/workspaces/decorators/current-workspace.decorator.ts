import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common';

import type { WorkspaceRequest } from '../interfaces/workspace-request.interface';

export const CurrentWorkspace = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<WorkspaceRequest>();

    if (!request.workspaceId) {
      throw new ForbiddenException('Workspace context not found');
    }

    return request.workspaceId;
  },
);
