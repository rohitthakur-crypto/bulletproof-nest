import { INestApplication } from '@nestjs/common';

import { ApiExceptionFilter } from '@/core/api';
import { AppConfigService } from '@/core/config';

export function setupFilters(app: INestApplication): void {
  app.useGlobalFilters(new ApiExceptionFilter(app.get(AppConfigService)));
}
