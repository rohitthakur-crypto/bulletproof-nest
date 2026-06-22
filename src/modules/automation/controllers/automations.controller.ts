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
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { WorkspaceMemberRole } from '@prisma/client';

import type {
  AutomationDetailResponse,
  AutomationResponse,
  PaginatedAutomationsResponse,
} from '../dto/responses';
import {
  AutomationDetailResponseDto,
  AutomationResponseDto,
  PaginatedAutomationsResponseDto,
} from '../dto/responses';
import { AutomationPublishService } from '../services/automation-publish.service';
import { AutomationQueryService } from '../services/automation-query.service';
import { AutomationService } from '../services/automation.service';
import { CreateAutomationDto, ListAutomationsQueryDto, UpdateAutomationDto } from '../validators';

import { SWAGGER_TAGS } from '@/common/constants';
import { ApiVersion } from '@/common/enums';
import { CurrentUser } from '@/modules/user-auth/decorators';
import { UserAuthGuard } from '@/modules/user-auth/guards/user-auth.guard';
import type { AuthenticatedUser } from '@/modules/user-auth/interfaces';
import { CurrentWorkspace, WorkspaceRoles } from '@/modules/workspaces/decorators';
import { WorkspaceMemberGuard } from '@/modules/workspaces/guards/workspace-member.guard';
import { WorkspaceRolesGuard } from '@/modules/workspaces/guards/workspace-roles.guard';

@ApiTags(SWAGGER_TAGS.AUTOMATIONS)
@Controller({ path: 'automations', version: ApiVersion.V1 })
@UseGuards(UserAuthGuard, WorkspaceMemberGuard)
@ApiBearerAuth()
export class AutomationsController {
  constructor(
    private readonly automationService: AutomationService,
    private readonly automationQueryService: AutomationQueryService,
    private readonly automationPublishService: AutomationPublishService,
  ) {}

  // ─── CRUD ─────────────────────────────────────────────────────────────────────

  @Post()
  @UseGuards(WorkspaceRolesGuard)
  @WorkspaceRoles(WorkspaceMemberRole.OWNER)
  @ApiOperation({ summary: 'Create a new automation' })
  @ApiCreatedResponse({ description: 'Automation created', type: AutomationDetailResponseDto })
  async createAutomation(
    @CurrentWorkspace() workspaceId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAutomationDto,
  ): Promise<AutomationDetailResponse> {
    return this.automationService.create(workspaceId, user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List automations' })
  @ApiOkResponse({ description: 'Paginated automations', type: PaginatedAutomationsResponseDto })
  async listAutomations(
    @CurrentWorkspace() workspaceId: string,
    @Query() query: ListAutomationsQueryDto,
  ): Promise<PaginatedAutomationsResponse> {
    return this.automationQueryService.listAutomations(workspaceId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get automation detail' })
  @ApiOkResponse({ description: 'Automation detail', type: AutomationDetailResponseDto })
  async getAutomation(
    @CurrentWorkspace() workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AutomationDetailResponse> {
    return this.automationQueryService.getAutomationDetail(workspaceId, id);
  }

  @Patch(':id')
  @UseGuards(WorkspaceRolesGuard)
  @WorkspaceRoles(WorkspaceMemberRole.OWNER)
  @ApiOperation({ summary: 'Update automation' })
  @ApiOkResponse({ description: 'Automation updated', type: AutomationDetailResponseDto })
  async updateAutomation(
    @CurrentWorkspace() workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAutomationDto,
  ): Promise<AutomationDetailResponse> {
    return this.automationService.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @UseGuards(WorkspaceRolesGuard)
  @WorkspaceRoles(WorkspaceMemberRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete automation' })
  @ApiOkResponse({ description: 'Automation deleted', type: AutomationResponseDto })
  async deleteAutomation(
    @CurrentWorkspace() workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AutomationResponse> {
    return this.automationService.delete(workspaceId, id);
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────────

  @Post(':id/publish')
  @UseGuards(WorkspaceRolesGuard)
  @WorkspaceRoles(WorkspaceMemberRole.OWNER)
  @ApiOperation({ summary: 'Publish automation (DRAFT → ACTIVE)' })
  @ApiOkResponse({ description: 'Automation published', type: AutomationResponseDto })
  async publishAutomation(
    @CurrentWorkspace() workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AutomationResponse> {
    return this.automationPublishService.publish(workspaceId, id);
  }

  @Post(':id/pause')
  @UseGuards(WorkspaceRolesGuard)
  @WorkspaceRoles(WorkspaceMemberRole.OWNER)
  @ApiOperation({ summary: 'Pause automation (ACTIVE → PAUSED)' })
  @ApiOkResponse({ description: 'Automation paused', type: AutomationResponseDto })
  async pauseAutomation(
    @CurrentWorkspace() workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AutomationResponse> {
    return this.automationPublishService.pause(workspaceId, id);
  }

  @Post(':id/resume')
  @UseGuards(WorkspaceRolesGuard)
  @WorkspaceRoles(WorkspaceMemberRole.OWNER)
  @ApiOperation({ summary: 'Resume automation (PAUSED → ACTIVE)' })
  @ApiOkResponse({ description: 'Automation resumed', type: AutomationResponseDto })
  async resumeAutomation(
    @CurrentWorkspace() workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AutomationResponse> {
    return this.automationPublishService.resume(workspaceId, id);
  }

  @Post(':id/duplicate')
  @UseGuards(WorkspaceRolesGuard)
  @WorkspaceRoles(WorkspaceMemberRole.OWNER)
  @ApiOperation({ summary: 'Duplicate automation' })
  @ApiCreatedResponse({ description: 'Automation duplicated', type: AutomationDetailResponseDto })
  async duplicateAutomation(
    @CurrentWorkspace() workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AutomationDetailResponse> {
    return this.automationService.duplicate(workspaceId, id, user);
  }

  @Post(':id/archive')
  @UseGuards(WorkspaceRolesGuard)
  @WorkspaceRoles(WorkspaceMemberRole.OWNER)
  @ApiOperation({ summary: 'Archive automation (DRAFT/PAUSED → ARCHIVED)' })
  @ApiOkResponse({ description: 'Automation archived', type: AutomationResponseDto })
  async archiveAutomation(
    @CurrentWorkspace() workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AutomationResponse> {
    return this.automationService.archive(workspaceId, id);
  }
}
