import type { SocialPlatform } from '@prisma/client';

/**
 * Minimal selection sent by the client when connecting pages.
 * Structurally compatible with CreateSocialAccountType from social-accounts validators.
 */
export interface MetaPageSelection {
  pageId: string;
  connectFacebook: boolean;
  connectInstagram: boolean;
}

/**
 * Normalised per-platform connect data produced by MetaConnectService after
 * verifying pages and subscribing webhooks.  Consumed by SocialAccountsService
 * to persist the account.
 */
export interface MetaPageConnectData {
  metaPageId: string;
  platform: SocialPlatform;
  platformAccountId: string;
  accountName: string;
  username?: string;
  profilePicture?: string;
  accessToken: string;
  webhookSubscribed: boolean;
  webhookSubscribedAt: Date;
  webhookFields: string[];
  pageInfo: {
    id: string;
    name: string;
    pictureUrl?: string;
  };
}

export interface MetaConnectFailure {
  pageId: string;
  reason: string;
  message: string;
}

export interface MetaBuildConnectResult {
  payloads: MetaPageConnectData[];
  failures: MetaConnectFailure[];
}
