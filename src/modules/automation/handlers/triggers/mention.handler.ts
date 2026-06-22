import { Injectable } from '@nestjs/common';
import { AutomationTriggerType } from '@prisma/client';

import type { TriggerHandler } from '../../interfaces/action-handler.interface';
import type { TriggerPayload } from '../../interfaces/automation-context.interface';
import type { TriggerConfig } from '../../interfaces/trigger-config.interface';

import { AppLoggerService } from '@/core/logger/logger.service';

@Injectable()
export class MentionHandler implements TriggerHandler {
  constructor(private readonly logger: AppLoggerService) {}
  canHandle(triggerType: AutomationTriggerType): boolean {
    return (
      triggerType === AutomationTriggerType.STORY_MENTION ||
      triggerType === AutomationTriggerType.MENTION_CREATED
    );
  }

  matches(triggerConfig: TriggerConfig, payload: TriggerPayload): boolean {
    this.logger.debug('MentionHandler matches', { triggerConfig, payload });
    return true;
  }
}
