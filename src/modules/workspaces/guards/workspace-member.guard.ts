import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

import type { WorkspaceRequest } from '../interfaces/workspace-request.interface';
import { WorkspaceMemberService } from '../services/workspace-member.service';
import { resolveWorkspaceIdFromHeader } from '../utils/resolve-workspace-header.util';

@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
  constructor(private readonly workspaceMemberService: WorkspaceMemberService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<WorkspaceRequest>();
    const workspaceId = resolveWorkspaceIdFromHeader(request);

    if (!workspaceId) {
      throw new ForbiddenException('workspace is required');
    }

    const member = await this.workspaceMemberService.requireMembership(
      workspaceId,
      request.user.userId,
    );

    request.workspaceId = member.workspaceId;
    request.workspaceMember = member;

    return true;
  }
}
