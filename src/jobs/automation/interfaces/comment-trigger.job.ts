/**
 * Payload pushed to the `automation-trigger` queue when a comment event
 * arrives from the Meta webhook pipeline.
 */
export interface CommentTriggerJob {
  /** Internal workspace ID */
  workspaceId: string;

  /** Internal SocialAccount ID (the page/IG account that received the comment) */
  socialAccountId: string;

  /** Internal SocialPost ID the comment was made on (if known) */
  socialPostId?: string;

  /** Meta's comment ID — used for idempotency */
  externalCommentId: string;

  /** The raw comment text */
  commentText: string;

  /** Meta user ID of the person who commented */
  senderId: string;

  /** Display name of the commenter (may be absent) */
  senderName?: string;

  /** Platform the comment arrived on */
  platform: 'INSTAGRAM' | 'FACEBOOK';

  /** ISO 8601 timestamp of when the comment was received */
  receivedAt: string;
}
