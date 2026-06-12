import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

import type { WorkspaceRequest } from '../interfaces';
import { WorkspaceMemberService } from '../services/workspace-member.service';

@Injectable()
export class WorkspaceRouteMemberGuard implements CanActivate {
  constructor(private readonly workspaceMemberService: WorkspaceMemberService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<WorkspaceRequest>();
    const workspaceId = (request.params as { id?: string }).id?.trim();

    if (!workspaceId) {
      throw new ForbiddenException('Workspace not found');
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
