import { Injectable } from '@nestjs/common';
import { AutomationTriggerType, SocialPlatform } from '@prisma/client';

import { MetaChangeField, MetaWebhookObject } from '../enums';
import type {
  FacebookCommentEvent,
  FacebookDmEvent,
  PlatformWebhookHandler,
  RawFeedChangeValue,
  WebhookChange,
  WebhookEntry,
  WebhookMessagingEvent,
} from '../interfaces';

import { AppLoggerService } from '@/core/logger/logger.service';
import { AutomationProducer } from '@/jobs/automation/producers/automation.producer';
import { SocialAccountsService } from '@/modules/social-accounts/services/social-accounts.service';

// ─── Handler ──────────────────────────────────────────────────────────────────

@Injectable()
export class FacebookHandler implements PlatformWebhookHandler {
  constructor(
    private readonly socialAccountService: SocialAccountsService,
    private readonly triggerProducer: AutomationProducer,
    private readonly logger: AppLoggerService,
  ) {}

  canHandle(object: MetaWebhookObject): boolean {
    return object === MetaWebhookObject.PAGE;
  }

  async handle(entry: WebhookEntry): Promise<void> {
    const account = await this.socialAccountService.findActiveByPlatformAccountId(entry.id);

    if (!account) return;

    await Promise.all([
      this.routeMessagingEvents(entry.messaging, account.id, account.workspaceId),
      this.routeChangeEvents(entry.changes, account.id, account.workspaceId),
    ]);
  }

  // ─── Messaging events (DMs) ──────────────────────────────────────────────────

  private async routeMessagingEvents(
    events: WebhookMessagingEvent[],
    socialAccountId: string,
    workspaceId: string,
  ): Promise<void> {
    for (const event of events) {
      if (event.message && event.sender) {
        const dm = this.parseDmEvent(event);
        if (dm) await this.handleDm(dm, socialAccountId, workspaceId);
      }
    }
  }

  private parseDmEvent(event: WebhookMessagingEvent): FacebookDmEvent | null {
    if (!event.sender || !event.recipient || !event.message) return null;

    const text = event.message.text;
    if (!text) return null;

    return {
      sender: event.sender,
      recipient: event.recipient,
      messageId: event.message.mid ?? '',
      text,
      timestamp: event.timestamp ?? Date.now(),
    };
  }

  private async handleDm(
    dm: FacebookDmEvent,
    socialAccountId: string,
    workspaceId: string,
  ): Promise<void> {
    this.logger.debug(`Facebook DM from ${dm.sender.id} → account ${socialAccountId}`);

    await this.triggerProducer.executeWorkflow({
      workspaceId,
      socialAccountId,
      triggerType: AutomationTriggerType.MESSAGE_RECEIVED,
      eventData: {
        senderId: dm.sender.id,
        messageText: dm.text,
        messageId: dm.messageId,
        platform: SocialPlatform.FACEBOOK,
        timestamp: dm.timestamp,
      },
      externalEventId: dm.messageId,
    });
  }

  // ─── Change events (comments, feed) ──────────────────────────────────────────

  private async routeChangeEvents(
    changes: WebhookChange[],
    socialAccountId: string,
    workspaceId: string,
  ): Promise<void> {
    for (const change of changes) {
      switch (change.field) {
        case MetaChangeField.FEED:
          await this.handleFeedChange(change.value, socialAccountId, workspaceId);
          break;

        case MetaChangeField.COMMENTS:
          await this.handleFeedChange(change.value, socialAccountId, workspaceId);
          break;

        default:
          this.logger.debug(`Unhandled Facebook change field: ${change.field}`);
      }
    }
  }

  private async handleFeedChange(
    raw: unknown,
    socialAccountId: string,
    workspaceId: string,
  ): Promise<void> {
    const comment = this.parseFeedComment(raw);
    if (!comment) return;

    this.logger.debug(
      `Facebook comment ${comment.commentId} on post ${comment.postId} from ${comment.from.id}`,
    );

    await this.triggerProducer.handleComment({
      workspaceId,
      socialAccountId,
      externalCommentId: comment.commentId,
      commentText: comment.message,
      senderId: comment.from.id,
      senderName: comment.from.name,
      platform: SocialPlatform.FACEBOOK,
      receivedAt: new Date(comment.createdTime * 1000).toISOString(),
    });
  }

  private parseFeedComment(raw: unknown): FacebookCommentEvent | null {
    const value = raw as RawFeedChangeValue;

    if (value?.item !== 'comment') return null;
    if (!value.comment_id || !value.post_id || !value.from || !value.message) return null;

    return {
      commentId: value.comment_id,
      postId: value.post_id,
      from: { id: value.from.id, name: value.from.name },
      message: value.message,
      createdTime: value.created_time ?? Math.floor(Date.now() / 1000),
    };
  }
}
