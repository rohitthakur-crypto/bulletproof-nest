import { INestApplication, RequestMethod, VersioningType } from '@nestjs/common';

import { API_VERSION_PREFIX, ApiVersion } from '@/common/enums';

export function setupApp(app: INestApplication) {
  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'admin/*path', method: RequestMethod.ALL },
      { path: 'health', method: RequestMethod.ALL },
      { path: 'health/*path', method: RequestMethod.ALL },
    ],
  });

  app.enableVersioning({
    type: VersioningType.URI,

    prefix: API_VERSION_PREFIX,

    defaultVersion: ApiVersion.V1,
  });
}
