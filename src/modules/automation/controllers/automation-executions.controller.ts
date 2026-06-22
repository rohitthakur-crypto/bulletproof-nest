import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import type { AutomationExecutionResponse, PaginatedExecutionsResponse } from '../dto/responses';
import { AutomationExecutionResponseDto, PaginatedExecutionsResponseDto } from '../dto/responses';
import { AutomationExecutionService } from '../services/automation-execution.service';
import { ListExecutionsQueryDto } from '../validators';

import { SWAGGER_TAGS } from '@/common/constants';
import { ApiVersion } from '@/common/enums';
import { UserAuthGuard } from '@/modules/user-auth/guards/user-auth.guard';
import { CurrentWorkspace } from '@/modules/workspaces/decorators';
import { WorkspaceMemberGuard } from '@/modules/workspaces/guards/workspace-member.guard';

@ApiTags(SWAGGER_TAGS.AUTOMATION_EXECUTIONS)
@Controller({ path: 'automations/:id/executions', version: ApiVersion.V1 })
@UseGuards(UserAuthGuard, WorkspaceMemberGuard)
@ApiBearerAuth()
export class AutomationExecutionsController {
  constructor(private readonly automationExecutionService: AutomationExecutionService) {}

  @Get()
  @ApiOperation({ summary: 'List executions for an automation' })
  @ApiOkResponse({
    description: 'Paginated execution history',
    type: PaginatedExecutionsResponseDto,
  })
  async listExecutions(
    @CurrentWorkspace() workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ListExecutionsQueryDto,
  ): Promise<PaginatedExecutionsResponse> {
    return this.automationExecutionService.listExecutions(workspaceId, id, query);
  }

  @Get(':executionId')
  @ApiOperation({ summary: 'Get a single execution' })
  @ApiOkResponse({ description: 'Execution detail', type: AutomationExecutionResponseDto })
  async getExecution(
    @CurrentWorkspace() workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('executionId', ParseUUIDPipe) executionId: string,
  ): Promise<AutomationExecutionResponse> {
    return this.automationExecutionService.getExecutionDetail(workspaceId, id, executionId);
  }
}
