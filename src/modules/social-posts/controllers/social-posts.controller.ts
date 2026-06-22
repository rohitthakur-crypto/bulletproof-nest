import { Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WorkspaceMemberRole } from '@prisma/client';

import type { ListSocialPostsResponse, SyncOlderPostsResponse } from '../dto';
import { ListSocialPostsResponseDto, SyncOlderPostsResponseDto } from '../dto';
import { SocialPostsService } from '../services/social-posts.service';
import { ListSocialPostsQueryDto } from '../validators';

import { SWAGGER_TAGS } from '@/common/constants';
import { ApiVersion } from '@/common/enums';
import { UserAuthGuard } from '@/modules/user-auth/guards/user-auth.guard';
import { WorkspaceRoles } from '@/modules/workspaces/decorators';
import { CurrentWorkspace } from '@/modules/workspaces/decorators';
import { WorkspaceMemberGuard } from '@/modules/workspaces/guards/workspace-member.guard';
import { WorkspaceRolesGuard } from '@/modules/workspaces/guards/workspace-roles.guard';

@ApiTags(SWAGGER_TAGS.SOCIAL_POSTS)
@Controller({ path: 'social-accounts/:id/posts', version: ApiVersion.V1 })
@UseGuards(UserAuthGuard, WorkspaceMemberGuard)
@ApiBearerAuth()
export class SocialPostsController {
  constructor(private readonly socialPostsService: SocialPostsService) {}

  @Get()
  @ApiOperation({ summary: 'List posts for a social account' })
  @ApiOkResponse({
    description:
      'Paginated local posts. Triggers an initial Meta fetch on first call when no posts are cached.',
    type: ListSocialPostsResponseDto,
  })
  async listPosts(
    @CurrentWorkspace() workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ListSocialPostsQueryDto,
  ): Promise<ListSocialPostsResponse> {
    return this.socialPostsService.listPosts(workspaceId, id, query);
  }

  @Post('refresh')
  @UseGuards(WorkspaceRolesGuard)
  @WorkspaceRoles(WorkspaceMemberRole.OWNER)
  @ApiOperation({ summary: 'Refresh latest 25 posts from Meta' })
  @ApiOkResponse({
    description:
      'Fetches the latest 25 posts from Meta, upserts them, and returns the first page of results. Never resets existing cursor.',
    type: ListSocialPostsResponseDto,
  })
  async refreshPosts(
    @CurrentWorkspace() workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ListSocialPostsResponse> {
    return this.socialPostsService.refreshPosts(workspaceId, id);
  }

  @Post('sync-older')
  @UseGuards(WorkspaceRolesGuard)
  @WorkspaceRoles(WorkspaceMemberRole.OWNER)
  @ApiOperation({ summary: 'Load older posts using the stored cursor' })
  @ApiOkResponse({
    description:
      'Uses the stored nextCursor to fetch older posts from Meta and upserts them. Returns the newly synced posts and updated sync state.',
    type: SyncOlderPostsResponseDto,
  })
  async syncOlderPosts(
    @CurrentWorkspace() workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SyncOlderPostsResponse> {
    return this.socialPostsService.syncOlderPosts(workspaceId, id);
  }
}
