import { SocialPlatform } from '@prisma/client';

export interface CommentTriggerJob {
  workspaceId: string;

  socialAccountId: string;

  socialPostId?: string;

  externalCommentId: string;

  commentText: string;

  senderId: string;

  senderName?: string;

  platform: SocialPlatform;

  receivedAt: string;
}
