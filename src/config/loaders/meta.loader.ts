import { registerAs } from '@nestjs/config';

import type { MetaConfig } from '../interfaces';
import { getValidatedEnv } from '../validation/validate-env';

export const metaConfig = registerAs('meta', (): MetaConfig => {
  const e = getValidatedEnv();

  return {
    appId: e.META_APP_ID,
    appSecret: e.META_APP_SECRET,

    facebook: {
      baseUrl: e.META_FACEBOOK_BASE_URL,
      version: e.META_GRAPH_API_VERSION,
    },

    graph: {
      version: e.META_GRAPH_API_VERSION,
      baseUrl: e.META_GRAPH_API_BASE_URL,
    },

    oauth: {
      redirectUri: e.META_OAUTH_REDIRECT_URI,
      successRedirectUri: e.META_OAUTH_SUCCESS_REDIRECT_URI || undefined,
      scopes: {
        facebook: e.META_FACEBOOK_OAUTH_SCOPES,
        instagram: e.META_INSTAGRAM_OAUTH_SCOPES,
        whatsapp: e.META_WHATSAPP_OAUTH_SCOPES,
      },
    },

    webhook: {
      verifyToken: e.META_WEBHOOK_VERIFY_TOKEN,
      path: e.META_WEBHOOK_PATH,
    },

    whatsapp: {
      configId: e.META_WHATSAPP_CONFIG_ID || undefined,
    },
  };
});
