import { Controller, Get, HttpCode, HttpStatus, VERSION_NEUTRAL } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';

import { LivenessDataDto, ReadinessDataDto } from '../dto/health-response.dto';
import { HealthService } from '../services/health.service';

import { SkipRequestTimeout } from '@/common/decorators';
import { ApiMessage } from '@/core/api';

@ApiTags('Health')
@SkipRequestTimeout()
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Detailed application health status' })
  @ApiOkResponse({ description: 'Health check completed' })
  @ApiServiceUnavailableResponse({
    description: 'Critical health check failed',
  })
  @ApiMessage('Health check completed')
  getHealth() {
    return this.healthService.getDetailedHealth();
  }

  @Get('live')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kubernetes liveness probe' })
  @ApiOkResponse({ type: LivenessDataDto })
  @ApiMessage('Liveness check completed')
  getLive() {
    return this.healthService.getLive();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Kubernetes readiness probe' })
  @ApiOkResponse({ type: ReadinessDataDto })
  @ApiServiceUnavailableResponse({ description: 'Service not ready' })
  @ApiMessage('Readiness check completed')
  getReady() {
    return this.healthService.getReady();
  }
}
