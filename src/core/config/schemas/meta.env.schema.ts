import { z } from 'zod';

import { parseCommaSeparated } from '../utils/parse-comma-separated.util';

export const metaEnvSchema = z.object({
  META_APP_ID: z.string().default(''),

  META_APP_SECRET: z.string().default(''),

  META_FACEBOOK_BASE_URL: z.string().url().default('https://www.facebook.com'),

  META_GRAPH_API_VERSION: z.string().min(1).default('v21.0'),

  META_GRAPH_API_BASE_URL: z.string().url().default('https://graph.facebook.com'),

  META_OAUTH_REDIRECT_URI: z
    .string()
    .url('META_OAUTH_REDIRECT_URI must be a valid URL')
    .default('http://localhost:3000/api/v1/social-accounts/meta/callback'),

  META_OAUTH_SUCCESS_REDIRECT_URI: z.string().default(''),

  META_FACEBOOK_OAUTH_SCOPES: z
    .string()
    .default('pages_show_list,pages_read_engagement,pages_manage_metadata,pages_messaging')
    .transform(parseCommaSeparated),

  META_INSTAGRAM_OAUTH_SCOPES: z
    .string()
    .default('instagram_basic,instagram_manage_messages,instagram_manage_comments,pages_show_list')
    .transform(parseCommaSeparated),

  META_WHATSAPP_OAUTH_SCOPES: z
    .string()
    .default('whatsapp_business_management,whatsapp_business_messaging')
    .transform(parseCommaSeparated),

  META_WEBHOOK_VERIFY_TOKEN: z.string().default(''),

  META_WEBHOOK_PATH: z.string().min(1).default('webhooks/meta'),

  META_WEBHOOK_SUBSCRIBED_FIELDS: z
    .string()
    .default('messages,messaging_postbacks,message_echoes,messaging_optins,message_reads,feed')
    .transform(parseCommaSeparated),

  META_WHATSAPP_CONFIG_ID: z.string().default(''),
});
