import { Injectable } from '@nestjs/common';

import { MetaWebhookObject } from '../enums';
import type { PlatformWebhookHandler, WebhookEntry } from '../interfaces';

import { AppLoggerService } from '@/core/logger/logger.service';

/**
 * WhatsApp Business webhook handler.
 * TODO: implement when WhatsApp integration is added.
 */
@Injectable()
export class WhatsappHandler implements PlatformWebhookHandler {
  constructor(private readonly logger: AppLoggerService) {}

  canHandle(object: MetaWebhookObject): boolean {
    return object === MetaWebhookObject.WHATSAPP_BUSINESS_ACCOUNT;
  }

  async handle(entry: WebhookEntry): Promise<void> {
    return new Promise((resolve) => resolve());
    this.logger.debug(`WhatsApp webhook entry received for ${entry.id} — not yet implemented`);
  }
}
