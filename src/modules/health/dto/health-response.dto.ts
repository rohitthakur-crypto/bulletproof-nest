import { ApiProperty } from '@nestjs/swagger';

/** Health payload inside enterprise `data` field — GET /health/live */
export class LivenessDataDto {
  @ApiProperty({ example: 'alive' })
  status!: 'alive';
}

/** Health payload inside enterprise `data` field — GET /health/ready */
export class ReadinessDataDto {
  @ApiProperty({ example: 'ok', enum: ['ok', 'error'] })
  status!: 'ok' | 'error';

  @ApiProperty({
    example: { database: 'up', redis: 'skipped', queue: 'skipped' },
  })
  services!: Record<string, string>;
}

/** Health payload inside enterprise `data` field — GET /health */
export class DetailedHealthDataDto {
  @ApiProperty({ example: 'ok', enum: ['ok', 'degraded', 'error'] })
  status!: 'ok' | 'degraded' | 'error';

  @ApiProperty({ example: 12345 })
  uptime!: number;

  @ApiProperty({
    example: {
      database: 'up',
      redis: 'skipped',
      queue: 'skipped',
      memory: 'up',
      disk: 'up',
    },
  })
  services!: Record<string, string>;
}

/** @deprecated Use DetailedHealthDataDto — health is wrapped in enterprise envelope */
export class LivenessResponseDto extends LivenessDataDto {}

/** @deprecated Use ReadinessDataDto */
export class ReadinessResponseDto extends ReadinessDataDto {}

/** @deprecated Use DetailedHealthDataDto */
export class DetailedHealthResponseDto extends DetailedHealthDataDto {}
