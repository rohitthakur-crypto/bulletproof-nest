import type { SocialAccount } from '@prisma/client';

import type { SocialAccountResponse } from '../dto';
import type { SocialAccountMetadata } from '../interfaces';

import { toIsoString } from '@/common/utils';

function parseSocialAccountMetadata(metadata: unknown): SocialAccountMetadata | undefined {
  if (!metadata || typeof metadata !== 'object') {
    return undefined;
  }

  const value = metadata as SocialAccountMetadata;

  if (!value.page?.id || !value.page?.name) {
    return undefined;
  }

  return value;
}

export function toSocialAccountResponse(account: SocialAccount): SocialAccountResponse {
  return {
    id: account.id,
    platform: account.platform,
    platformAccountId: account.platformAccountId,
    metaPageId: account.metaPageId ?? undefined,
    accountName: account.accountName,
    username: account.username ?? undefined,
    profilePicture: account.profilePicture ?? undefined,
    status: account.status,
    metadata: parseSocialAccountMetadata(account.metadata),
    createdAt: toIsoString(account.createdAt)!,
    updatedAt: toIsoString(account.updatedAt)!,
  };
}
