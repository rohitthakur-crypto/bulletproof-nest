// ─── Shared ───────────────────────────────────────────────────────────────────

import { MetaChangeField, MetaWebhookObject } from '../enums';

/**
 * Common Meta user reference embedded in webhook events.
 */
export interface MetaEventUser {
  id: string;
  name?: string;
}

// ─── Platform handler contract ────────────────────────────────────────────────

export interface PlatformWebhookHandler {
  canHandle(object: MetaWebhookObject): boolean;
  handle(entry: WebhookEntry): Promise<void>;
}

/**
 * Normalised entry passed to platform handlers.
 * Mirrors the shape of MetaWebhookEntry but with concrete types where possible.
 */
export interface WebhookEntry {
  /** Meta page ID / IG business account ID */
  id: string;
  time?: number;
  messaging: WebhookMessagingEvent[];
  changes: WebhookChange[];
}

export interface WebhookMessagingEvent {
  sender?: MetaEventUser;
  recipient?: MetaEventUser;
  timestamp?: number;
  message?: WebhookMessage;
  postback?: WebhookPostback;
  delivery?: WebhookDelivery;
  read?: WebhookRead;
}

export interface WebhookMessage {
  mid?: string;
  text?: string;
  attachments?: unknown[];
  quick_reply?: { payload: string };
}

export interface WebhookPostback {
  title?: string;
  payload?: string;
}

export interface WebhookDelivery {
  mids?: string[];
  watermark?: number;
}

export interface WebhookRead {
  watermark?: number;
}

export interface WebhookChange {
  field: MetaChangeField;
  value: unknown;
}

// ─── Raw Meta API change.value shapes ────────────────────────────────────────
// These mirror the exact JSON Meta sends inside `entry.changes[].value`.

export interface RawFeedChangeValue {
  item?: string;
  comment_id?: string;
  post_id?: string;
  from?: { id: string; name?: string };
  message?: string;
  created_time?: number;
}

export interface RawInstagramCommentValue {
  id?: string;
  text?: string;
  media?: { id?: string };
  from?: { id: string; username?: string };
  timestamp?: number;
}

export interface RawInstagramMentionValue {
  media_id?: string;
  comment_id?: string;
}

// ─── Facebook specific ────────────────────────────────────────────────────────

/**
 * Parsed payload when `entry.changes[].field === 'feed'` and `value.item === 'comment'`.
 * Meta Graph API reference: https://developers.facebook.com/docs/graph-api/webhooks/reference/page/#feed
 */
export interface FacebookCommentEvent {
  /** Meta comment ID */
  commentId: string;
  /** Meta post ID the comment was made on */
  postId: string;
  /** The commenter */
  from: MetaEventUser;
  /** Raw comment text */
  message: string;
  /** Unix timestamp */
  createdTime: number;
}

/**
 * Parsed payload when `entry.messaging[].message` is present (Facebook DM).
 */
export interface FacebookDmEvent {
  sender: MetaEventUser;
  recipient: MetaEventUser;
  /** Mid — Meta message ID */
  messageId: string;
  text: string;
  timestamp: number;
}

// ─── Instagram specific ───────────────────────────────────────────────────────

/**
 * Parsed payload when `entry.changes[].field === 'comments'`.
 * Meta Graph API reference: https://developers.facebook.com/docs/instagram-api/webhooks/reference#comments
 */
export interface InstagramCommentEvent {
  /** Meta comment ID */
  commentId: string;
  /** Media (post) ID the comment was made on */
  mediaId: string;
  /** The commenter */
  from: MetaEventUser;
  /** Raw comment text */
  text: string;
  /** Unix timestamp */
  timestamp: number;
}

/**
 * Parsed payload when `entry.changes[].field === 'mentions'`.
 */
export interface InstagramMentionEvent {
  /** Media ID where the account was mentioned */
  mediaId: string;
  /** The user who mentioned */
  from?: MetaEventUser;
  /** Story/post ID */
  commentId?: string;
}

/**
 * Parsed payload when `entry.messaging[].message` is present (Instagram DM).
 */
export interface InstagramDmEvent {
  sender: MetaEventUser;
  recipient: MetaEventUser;
  messageId: string;
  text: string;
  timestamp: number;
}
