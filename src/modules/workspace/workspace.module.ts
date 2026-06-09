import { Module } from '@nestjs/common';

import { WorkspaceMemberCacheService } from './cache/workspace-member.cache';
import { WorkspaceCacheService } from './cache/workspace.cache';
import { WorkspaceMemberRepository } from './repositories/workspace-member.repository';
import { WorkspaceRepository } from './repositories/workspace.repository';
import { WorkspaceMemberService } from './services/workspace-member.service';
import { WorkspaceService } from './services/workspace.service';

@Module({
  providers: [
    WorkspaceRepository,
    WorkspaceMemberRepository,
    WorkspaceCacheService,
    WorkspaceMemberCacheService,
    WorkspaceService,
    WorkspaceMemberService,
  ],
  exports: [WorkspaceService, WorkspaceMemberService],
})
export class WorkspaceModule {}
