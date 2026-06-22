import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { WorkspaceMemberRole } from '@prisma/client';

import { WorkspaceRoles } from '../decorators';
import { type WorkspaceResponse, WorkspaceResponseDto } from '../dto';
import { WorkspaceRolesGuard } from '../guards/workspace-roles.guard';
import { WorkspaceRouteMemberGuard } from '../guards/workspace-route-member.guard';
import { WorkspaceService } from '../services/workspace.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from '../validators';

import { SWAGGER_TAGS } from '@/common/constants';
import { ApiVersion } from '@/common/enums';
import { ApiMessage } from '@/core/api';
import { CurrentUser } from '@/modules/user-auth/decorators/current-user.decorator';
import { UserAuthGuard } from '@/modules/user-auth/guards/user-auth.guard';
import type { AuthenticatedUser } from '@/modules/user-auth/interfaces';

@ApiTags(SWAGGER_TAGS.WORKSPACES)
@Controller({ path: 'workspaces', version: ApiVersion.V1 })
@UseGuards(UserAuthGuard)
@ApiBearerAuth()
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get()
  @ApiMessage('Workspaces fetched successfully')
  @ApiOkResponse({
    description: 'List of workspaces for the current user',
    type: [WorkspaceResponseDto],
  })
  listForUser(@CurrentUser() user: AuthenticatedUser): Promise<WorkspaceResponse[]> {
    return this.workspaceService.listForUser(user.userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiMessage('Workspace created successfully')
  @ApiOkResponse({ description: 'Created workspace', type: WorkspaceResponseDto })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ): Promise<WorkspaceResponse> {
    return this.workspaceService.createForUser(user.userId, createWorkspaceDto);
  }

  @Get(':id')
  @UseGuards(WorkspaceRouteMemberGuard)
  @ApiMessage('Workspace fetched successfully')
  @ApiOkResponse({ description: 'Workspace details', type: WorkspaceResponseDto })
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<WorkspaceResponse> {
    return this.workspaceService.getById(id);
  }

  @Patch(':id')
  @UseGuards(WorkspaceRouteMemberGuard, WorkspaceRolesGuard)
  @WorkspaceRoles(WorkspaceMemberRole.OWNER, WorkspaceMemberRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiMessage('Workspace updated successfully')
  @ApiOkResponse({ description: 'Updated workspace', type: WorkspaceResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ): Promise<WorkspaceResponse> {
    return this.workspaceService.update(id, updateWorkspaceDto);
  }

  @Delete(':id')
  @UseGuards(WorkspaceRouteMemberGuard, WorkspaceRolesGuard)
  @WorkspaceRoles(WorkspaceMemberRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiMessage('Workspace deleted successfully')
  @ApiOkResponse({ description: 'Deleted workspace', type: WorkspaceResponseDto })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<WorkspaceResponse> {
    return this.workspaceService.remove(id);
  }
}
