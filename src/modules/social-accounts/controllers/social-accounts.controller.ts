// import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
// import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
// import { WorkspaceMemberRole } from '@prisma/client';

// import { SocialAccountsService } from '../services/social-accounts.service';

// import { SWAGGER_TAGS } from '@/common/constants';
// import { ApiVersion } from '@/common/enums';
// import { CurrentUser } from '@/modules/user-auth/decorators';
// import { UserAuthGuard } from '@/modules/user-auth/guards';
// import { type AuthenticatedUser } from '@/modules/user-auth/interfaces';
// import { WorkspaceRoles } from '@/modules/workspaces/decorators';
// import { CurrentWorkspace } from '@/modules/workspaces/decorators';
// import { WorkspaceMemberGuard } from '@/modules/workspaces/guards';
// import { WorkspaceRolesGuard } from '@/modules/workspaces/guards';
// import { CreateSocialAccountResponse, MetaPageResponse, MetaPageResponseDto } from '../dto';
// import { CreateSocialAccountDto } from '../validators';

// @ApiTags(SWAGGER_TAGS.SOCIAL_ACCOUNTS)
// @Controller({ path: 'social-accounts', version: ApiVersion.V1 })
// @UseGuards(UserAuthGuard, WorkspaceMemberGuard)
// @ApiBearerAuth()
// export class SocialAccountsController {
//   constructor(private readonly socialAccountsService: SocialAccountsService) {}

//   @Post()
//   @UseGuards(WorkspaceRolesGuard)
//   @WorkspaceRoles(WorkspaceMemberRole.OWNER)
//   @ApiOperation({ summary: 'Create social account' })
//   // @ApiOkResponse({ description: 'Social account created', type: SocialAccountResponseDto })
//   async createSocialAccount(
//     @CurrentUser() user: AuthenticatedUser,
//     @CurrentWorkspace() workspaceId: string,
//     @Body() createSocialAccountDto: CreateSocialAccountDto): Promise<CreateSocialAccountResponse> {
//     return this.socialAccountsService.createSocialAccount(user, workspaceId, createSocialAccountDto);
//   }
// }
