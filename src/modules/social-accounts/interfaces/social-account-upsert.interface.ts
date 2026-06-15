import type { SocialPlatform } from '@prisma/client';

export interface SocialAccountMetaPageInfo {
  id: string;
  name: string;
  pictureUrl?: string;
}

export interface SocialAccountMetadata {
  page: SocialAccountMetaPageInfo;
}

export interface SocialAccountUpsertPayload {
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

export interface SocialAccountConnectResult {
  id: string;
  platform: SocialPlatform;
  platformAccountId: string;
  accountName: string;
  username?: string;
  profilePicture?: string;
  created: boolean;
}
