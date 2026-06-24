import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';

import { FacebookHandler } from '../handlers/facebook.handler';
import { InstagramHandler } from '../handlers/instagram.handler';
import { WhatsappHandler } from '../handlers/whatsapp.handler';
import type { PlatformWebhookHandler } from '../interfaces';
import type { MetaWebhookEventBody, MetaWebhookVerifyQuery } from '../validators';

import { AppConfigService } from '@/core/config/services/app-config.service';
import { AppLoggerService } from '@/core/logger/logger.service';

@Injectable()
export class MetaWebhookService {
  private readonly handlers: PlatformWebhookHandler[];

  constructor(
    private readonly logger: AppLoggerService,
    private readonly config: AppConfigService,
    facebookHandler: FacebookHandler,
    instagramHandler: InstagramHandler,
    whatsappHandler: WhatsappHandler,
  ) {
    this.handlers = [facebookHandler, instagramHandler, whatsappHandler];
  }

  /**
   * Handles Meta's GET challenge-response subscription verification.
   * Returns the raw challenge string — the controller sends it as plain text.
   */
  verifySubscription(query: MetaWebhookVerifyQuery): string {
    const { verifyToken } = this.config.meta.webhook;

    if (!verifyToken) {
      throw new InternalServerErrorException('META_WEBHOOK_VERIFY_TOKEN is not configured');
    }

    if (query['hub.verify_token'] !== verifyToken) {
      throw new ForbiddenException('Invalid webhook verify token');
    }

    return query['hub.challenge'];
  }

  /**
   * Entry point for all inbound Meta webhook events.
   * Dispatches each entry to the correct platform handler.
   * Returns immediately — all heavy processing is deferred to BullMQ workers.
   */
  async handleWebhook(body: MetaWebhookEventBody): Promise<void> {
    console.log('handleWebhook', JSON.stringify(body, null, 2));
    const handler = this.handlers.find((h) => h.canHandle(body.object));

    if (!handler) {
      this.logger.warn(`No handler registered for Meta webhook object: ${body.object}`);
      return;
    }

    this.logger.debug(`Routing ${body.entry.length} entries for object "${body.object}"`);

    for (const entry of body.entry) {
      await handler.handle(entry);
    }
  }
}
