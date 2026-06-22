import { Injectable } from '@nestjs/common';
import { AutomationTriggerType, SocialPlatform } from '@prisma/client';

import { MetaChangeField, MetaWebhookObject } from '../enums';
import type {
  InstagramCommentEvent,
  InstagramDmEvent,
  InstagramMentionEvent,
  PlatformWebhookHandler,
  RawInstagramCommentValue,
  RawInstagramMentionValue,
  WebhookChange,
  WebhookEntry,
  WebhookMessagingEvent,
} from '../interfaces';

import { AppLoggerService } from '@/core/logger/logger.service';
import { AutomationTriggerProducer } from '@/jobs/automation/producers/automation-trigger.producer';
import { SocialAccountsService } from '@/modules/social-accounts/services/social-accounts.service';

// ─── Handler ──────────────────────────────────────────────────────────────────

@Injectable()
export class InstagramHandler implements PlatformWebhookHandler {
  constructor(
    private readonly socialAccountService: SocialAccountsService,
    private readonly triggerProducer: AutomationTriggerProducer,
    private readonly logger: AppLoggerService,
  ) {}

  canHandle(object: MetaWebhookObject): boolean {
    return object === MetaWebhookObject.INSTAGRAM;
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

  private parseDmEvent(event: WebhookMessagingEvent): InstagramDmEvent | null {
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
    dm: InstagramDmEvent,
    socialAccountId: string,
    workspaceId: string,
  ): Promise<void> {
    this.logger.debug(`Instagram DM from ${dm.sender.id} → account ${socialAccountId}`);

    await this.triggerProducer.executeWorkflow({
      workspaceId,
      socialAccountId,
      triggerType: AutomationTriggerType.MESSAGE_RECEIVED,
      eventData: {
        senderId: dm.sender.id,
        messageText: dm.text,
        messageId: dm.messageId,
        platform: SocialPlatform.INSTAGRAM,
        timestamp: dm.timestamp,
      },
      externalEventId: dm.messageId,
    });
  }

  // ─── Change events (comments, mentions) ──────────────────────────────────────

  private async routeChangeEvents(
    changes: WebhookChange[],
    socialAccountId: string,
    workspaceId: string,
  ): Promise<void> {
    for (const change of changes) {
      switch (change.field) {
        case MetaChangeField.COMMENTS:
          await this.handleCommentChange(change.value, socialAccountId, workspaceId);
          break;

        case MetaChangeField.MENTIONS:
          await this.handleMentionChange(change.value, socialAccountId, workspaceId);
          break;

        default:
          this.logger.debug(`Unhandled Instagram change field: ${change.field}`);
      }
    }
  }

  private async handleCommentChange(
    raw: unknown,
    socialAccountId: string,
    workspaceId: string,
  ): Promise<void> {
    const comment = this.parseComment(raw);
    if (!comment) return;

    this.logger.debug(
      `Instagram comment ${comment.commentId} on media ${comment.mediaId} from ${comment.from.id}`,
    );

    await this.triggerProducer.handleComment({
      workspaceId,
      socialAccountId,
      externalCommentId: comment.commentId,
      commentText: comment.text,
      senderId: comment.from.id,
      senderName: comment.from.name,
      platform: SocialPlatform.INSTAGRAM,
      receivedAt: new Date(comment.timestamp * 1000).toISOString(),
    });
  }

  private async handleMentionChange(
    raw: unknown,
    socialAccountId: string,
    workspaceId: string,
  ): Promise<void> {
    const mention = this.parseMention(raw);
    if (!mention) return;

    this.logger.debug(`Instagram mention on media ${mention.mediaId} → account ${socialAccountId}`);

    await this.triggerProducer.executeWorkflow({
      workspaceId,
      socialAccountId,
      triggerType: AutomationTriggerType.STORY_MENTION,
      eventData: {
        mediaId: mention.mediaId,
        commentId: mention.commentId,
        platform: SocialPlatform.INSTAGRAM,
      },
      externalEventId: mention.commentId ?? mention.mediaId,
    });
  }

  // ─── Parsers ──────────────────────────────────────────────────────────────────

  private parseComment(raw: unknown): InstagramCommentEvent | null {
    const value = raw as RawInstagramCommentValue;

    if (!value?.id || !value.text || !value.from) return null;

    return {
      commentId: value.id,
      mediaId: value.media?.id ?? '',
      from: { id: value.from.id, name: value.from.username },
      text: value.text,
      timestamp: value.timestamp ?? Math.floor(Date.now() / 1000),
    };
  }

  private parseMention(raw: unknown): InstagramMentionEvent | null {
    const value = raw as RawInstagramMentionValue;

    if (!value?.media_id) return null;

    return {
      mediaId: value.media_id,
      commentId: value.comment_id,
    };
  }
}
