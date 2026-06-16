import type { SocialPlatform } from '@prisma/client';

export interface SocialAccountMetaPageInfo {
  id: string;
  name: string;
  pictureUrl?: string;
}

export interface SocialAccountMetadata {
  page: SocialAccountMetaPageInfo;
}

export interface SocialAccountConnectPayload {
  platform: SocialPlatform;
  platformAccountId: string;
  metaPageId: string;
  accountName: string;
  username?: string;
  profilePicture?: string;
  accessToken: string;
  expiresAt?: Date | null;
  metadata: SocialAccountMetadata;
}

export interface SocialAccountUpsertPayload extends SocialAccountConnectPayload {
  webhookSubscribed: boolean;
  webhookSubscribedAt?: Date | null;
  webhookFields: string[];
}

export interface SocialAccountConnectResult {
  id: string;
  platform: SocialPlatform;
  platformAccountId: string;
  accountName: string;
  username?: string;
  profilePicture?: string;
  webhookSubscribed: boolean;
  created: boolean;
}

export interface SocialAccountConnectFailure {
  pageId: string;
  reason: string;
  message: string;
}

export interface CreateSocialAccountsConnectResponse {
  connected: SocialAccountConnectResult[];
  failed: SocialAccountConnectFailure[];
}
