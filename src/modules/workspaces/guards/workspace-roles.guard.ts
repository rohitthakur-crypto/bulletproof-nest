import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { WorkspaceMemberRole } from '@prisma/client';

import { WORKSPACE_ROLES_KEY } from '../constants/workspace-roles.constant';
import type { WorkspaceRequest } from '../interfaces/workspace-request.interface';

@Injectable()
export class WorkspaceRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<WorkspaceMemberRole[]>(
      WORKSPACE_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<WorkspaceRequest>();
    const member = request.workspaceMember;

    if (!member || !requiredRoles.includes(member.role)) {
      throw new ForbiddenException('Insufficient workspace permissions');
    }

    return true;
  }
}
