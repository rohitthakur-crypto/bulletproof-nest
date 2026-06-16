import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';

import type { MetaWebhookEventBody } from '../validators';
import type { MetaWebhookVerifyQuery } from '../validators';

import { AppConfigService } from '@/core/config';
import { AppLoggerService } from '@/core/logger';

@Injectable()
export class MetaWebhookService {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly config: AppConfigService,
  ) {}

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
   * Entry-point for all inbound Meta webhook events.
   * Currently validates the payload shape (via Zod DTO) and logs it.
   *
   * TODO: persist raw event to WebhookEvent table
   * TODO: dispatch to BullMQ queue for async processing
   * TODO: route to platform-specific handler (Facebook / Instagram / WhatsApp)
   */
  handleWebhook(body: MetaWebhookEventBody): void {
    this.logger.info('Meta webhook received', {
      object: body.object,
      entryCount: body.entry.length,
    });
  }
}
