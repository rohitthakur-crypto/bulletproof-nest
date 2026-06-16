import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WorkspaceMemberRole } from '@prisma/client';
import type { FastifyReply } from 'fastify';

import type { ConnectableAssetResponse } from '../dto';
import { ConnectableAssetResponseDto } from '../dto';
import { MetaService } from '../services';
import { MetaOAuthCallbackQueryDto } from '../validators';

import { SWAGGER_TAGS } from '@/common/constants';
import { ApiVersion } from '@/common/enums';
import { SkipEnvelope } from '@/core/api/decorators';
import { AppLoggerService } from '@/core/logger';
import { CurrentUser } from '@/modules/user-auth/decorators';
import { UserAuthGuard } from '@/modules/user-auth/guards';
import type { AuthenticatedUser } from '@/modules/user-auth/interfaces';
import { CurrentWorkspace, WorkspaceRoles } from '@/modules/workspaces/decorators';
import { WorkspaceMemberGuard, WorkspaceRolesGuard } from '@/modules/workspaces/guards';

@ApiTags(SWAGGER_TAGS.META)
@Controller({ path: 'meta', version: ApiVersion.V1 })
@ApiBearerAuth()
export class MetaController {
  constructor(
    private readonly metaService: MetaService,
    private readonly logger: AppLoggerService,
  ) {}

  @Get('connect')
  @UseGuards(UserAuthGuard, WorkspaceMemberGuard, WorkspaceRolesGuard)
  @WorkspaceRoles(WorkspaceMemberRole.OWNER)
  @ApiOperation({ summary: 'Get Meta OAuth URL' })
  @ApiOkResponse({ description: 'Meta OAuth redirect URL', type: String })
  async connect(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspace() workspaceId: string,
  ): Promise<string> {
    return this.metaService.generateAuthUrl(user, workspaceId);
  }

  @Get('callback')
  @SkipEnvelope()
  @ApiOperation({ summary: 'Handle Meta OAuth callback' })
  async callback(
    @Query() query: MetaOAuthCallbackQueryDto,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    const redirectUrl = await this.metaService.handleOAuthCallback(query);
    return reply.redirect(redirectUrl, 302);
  }

  @Get('available-accounts')
  @UseGuards(UserAuthGuard, WorkspaceMemberGuard, WorkspaceRolesGuard)
  @WorkspaceRoles(WorkspaceMemberRole.OWNER)
  @ApiOperation({ summary: 'List connectable Meta pages and linked Instagram accounts' })
  @ApiOkResponse({
    description: 'Connectable Meta assets',
    type: ConnectableAssetResponseDto,
    isArray: true,
  })
  async availableAccounts(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspace() workspaceId: string,
  ): Promise<ConnectableAssetResponse[]> {
    return this.metaService.listConnectableAssets(user, workspaceId);
  }
}
