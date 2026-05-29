import { INestApplication } from '@nestjs/common';

import { GlobalExceptionFilter } from '@/common/filters';
import { AppConfigService } from '@/config';

export function setupFilters(app: INestApplication): void {
  app.useGlobalFilters(new GlobalExceptionFilter(app.get(AppConfigService)));
}
