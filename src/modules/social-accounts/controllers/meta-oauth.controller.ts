import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WorkspaceMemberRole } from '@prisma/client';
import type { FastifyReply } from 'fastify';

import { MetaPageResponse, MetaPageResponseDto } from '../dto';
import { MetaService } from '../services/meta.service';
import { MetaOAuthCallbackQueryDto } from '../validators';

import { SWAGGER_TAGS } from '@/common/constants';
import { ApiVersion } from '@/common/enums';
import { SkipEnvelope } from '@/core/api';
import { CurrentUser } from '@/modules/user-auth/decorators';
import { UserAuthGuard } from '@/modules/user-auth/guards';
import type { AuthenticatedUser } from '@/modules/user-auth/interfaces';
import { CurrentWorkspace, WorkspaceRoles } from '@/modules/workspaces/decorators';
import { WorkspaceMemberGuard } from '@/modules/workspaces/guards';
import { WorkspaceRolesGuard } from '@/modules/workspaces/guards';

@ApiTags(SWAGGER_TAGS.META_OAUTH)
@Controller({ path: 'social-accounts/meta', version: ApiVersion.V1 })
@ApiBearerAuth()
export class MetaOauthController {
  constructor(private readonly metaService: MetaService) {}

  @Get('connect')
  @UseGuards(UserAuthGuard, WorkspaceMemberGuard, WorkspaceRolesGuard)
  @WorkspaceRoles(WorkspaceMemberRole.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Meta auth URL' })
  @ApiOkResponse({ description: 'Meta auth URL' })
  async connect(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspace() workspaceId: string,
  ): Promise<string> {
    return this.metaService.generateAuthUrl(user, workspaceId);
  }

  @Get('callback')
  @SkipEnvelope()
  async callback(@Query() query: MetaOAuthCallbackQueryDto, @Res() reply: FastifyReply) {
    const redirectUrl = await this.metaService.handleMetaOAuthCallback(query);

    return reply.redirect(redirectUrl, 302);
  }

  @Get('meta/pages')
  @UseGuards(UserAuthGuard, WorkspaceMemberGuard, WorkspaceRolesGuard)
  @WorkspaceRoles(WorkspaceMemberRole.OWNER)
  @ApiOperation({ summary: 'Get Meta pages' })
  @ApiOkResponse({ description: 'Meta pages', type: Array<MetaPageResponseDto> })
  async getMetaPages(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspace() workspaceId: string,
  ): Promise<Array<MetaPageResponse>> {
    return this.metaService.getMetaPages(user, workspaceId);
  }
}
