import { INestApplication } from '@nestjs/common';

import { ApiExceptionFilter } from '@/core/api/filters/api-exception.filter';
import { AppConfigService } from '@/core/config/services/app-config.service';

export function setupFilters(app: INestApplication): void {
  app.useGlobalFilters(new ApiExceptionFilter(app.get(AppConfigService)));
}
