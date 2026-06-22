import { Module, forwardRef } from '@nestjs/common';

import { WorkspaceMemberCacheService } from './cache/workspace-member.cache';
import { WorkspaceCacheService } from './cache/workspace.cache';
import { WorkspaceController } from './controllers/workspace.controller';
import { WorkspaceMemberGuard } from './guards/workspace-member.guard';
import { WorkspaceRolesGuard } from './guards/workspace-roles.guard';
import { WorkspaceRouteMemberGuard } from './guards/workspace-route-member.guard';
import { WorkspaceMemberRepository } from './repositories/workspace-member.repository';
import { WorkspaceRepository } from './repositories/workspace.repository';
import { WorkspaceMemberService } from './services/workspace-member.service';
import { WorkspaceService } from './services/workspace.service';

import { UserAuthModule } from '@/modules/user-auth';

@Module({
  imports: [forwardRef(() => UserAuthModule)],
  controllers: [WorkspaceController],
  providers: [
    WorkspaceRepository,
    WorkspaceMemberRepository,
    WorkspaceCacheService,
    WorkspaceMemberCacheService,
    WorkspaceService,
    WorkspaceMemberService,
    WorkspaceMemberGuard,
    WorkspaceRouteMemberGuard,
    WorkspaceRolesGuard,
  ],
  exports: [WorkspaceService, WorkspaceMemberService],
})
export class WorkspaceModule {}
