import { Module, forwardRef } from '@nestjs/common';

import { WorkspaceMemberCacheService } from './cache/workspace-member.cache';
import { WorkspaceCacheService } from './cache/workspace.cache';
import { WorkspaceController } from './controllers/workspace.controller';
import { WorkspaceMemberGuard, WorkspaceRouteMemberGuard, WorkspaceRolesGuard } from './guards';
import { WorkspaceMemberRepository, WorkspaceRepository } from './repositories';
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
