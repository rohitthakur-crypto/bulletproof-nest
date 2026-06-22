import type { SocialPost } from '@prisma/client';

import type { SocialPostResponse } from '../dto';

import { toIsoString } from '@/common/utils';

export function toSocialPostResponse(post: SocialPost): SocialPostResponse {
  return {
    id: post.id,
    workspaceId: post.workspaceId,
    socialAccountId: post.socialAccountId,
    platform: post.platform,
    platformPostId: post.platformPostId,
    caption: post.caption ?? undefined,
    mediaType: post.mediaType ?? undefined,
    mediaUrl: post.mediaUrl ?? undefined,
    thumbnailUrl: post.thumbnailUrl ?? undefined,
    permalink: post.permalink ?? undefined,
    publishedAt: toIsoString(post.publishedAt),
    lastSeenAt: toIsoString(post.lastSeenAt),
    createdAt: toIsoString(post.createdAt)!,
    updatedAt: toIsoString(post.updatedAt)!,
  };
}

export function toSocialPostResponses(posts: SocialPost[]): SocialPostResponse[] {
  return posts.map(toSocialPostResponse);
}
