import { INestApplication } from '@nestjs/common';

import { AppConfigService } from '@/config';
import { ApiExceptionFilter } from '@/core/api';

export function setupFilters(app: INestApplication): void {
  app.useGlobalFilters(new ApiExceptionFilter(app.get(AppConfigService)));
}
