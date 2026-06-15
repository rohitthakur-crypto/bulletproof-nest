import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WorkspaceMemberRole } from '@prisma/client';

import {
  CreateSocialAccountsResponse,
  CreateSocialAccountsResponseDto,
  PaginatedSocialAccountsResponse,
  PaginatedSocialAccountsResponseDto,
  SocialAccountResponse,
  SocialAccountResponseDto,
} from '../dto';
import { SocialAccountsService } from '../services/social-accounts.service';
import { CreateSocialAccountsDto, GetSocialAccountsQueryDto } from '../validators';

import { SWAGGER_TAGS } from '@/common/constants';
import { ApiVersion } from '@/common/enums';
import { CurrentUser } from '@/modules/user-auth/decorators';
import { UserAuthGuard } from '@/modules/user-auth/guards';
import { type AuthenticatedUser } from '@/modules/user-auth/interfaces';
import { WorkspaceRoles } from '@/modules/workspaces/decorators';
import { CurrentWorkspace } from '@/modules/workspaces/decorators';
import { WorkspaceMemberGuard } from '@/modules/workspaces/guards';
import { WorkspaceRolesGuard } from '@/modules/workspaces/guards';

@ApiTags(SWAGGER_TAGS.SOCIAL_ACCOUNTS)
@Controller({ path: 'social-accounts', version: ApiVersion.V1 })
@UseGuards(UserAuthGuard, WorkspaceMemberGuard)
@ApiBearerAuth()
export class SocialAccountsController {
  constructor(private readonly socialAccountsService: SocialAccountsService) {}

  @Get()
  @ApiOperation({ summary: 'List social accounts' })
  @ApiOkResponse({
    description: 'Paginated social accounts',
    type: PaginatedSocialAccountsResponseDto,
  })
  async listSocialAccounts(
    @CurrentWorkspace() workspaceId: string,
    @Query() query: GetSocialAccountsQueryDto,
  ): Promise<PaginatedSocialAccountsResponse> {
    return this.socialAccountsService.listSocialAccounts(workspaceId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get social account by ID' })
  @ApiOkResponse({ description: 'Social account details', type: SocialAccountResponseDto })
  async getSocialAccountById(
    @CurrentWorkspace() workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SocialAccountResponse> {
    return this.socialAccountsService.getSocialAccountById(workspaceId, id);
  }

  @Post()
  @UseGuards(WorkspaceRolesGuard)
  @WorkspaceRoles(WorkspaceMemberRole.OWNER)
  @ApiOperation({ summary: 'Create social account' })
  @ApiOkResponse({
    description: 'Social accounts connected',
    type: CreateSocialAccountsResponseDto,
  })
  async createSocialAccount(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentWorkspace() workspaceId: string,
    @Body() createSocialAccountsDto: CreateSocialAccountsDto,
  ): Promise<CreateSocialAccountsResponse> {
    return this.socialAccountsService.createSocialAccount(
      user,
      workspaceId,
      createSocialAccountsDto,
    );
  }
}
