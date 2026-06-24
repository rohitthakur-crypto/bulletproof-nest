import { Injectable } from '@nestjs/common';
import { AutomationTriggerType } from '@prisma/client';

import { KeywordMatchMode } from '../../enums';
import type {
  TriggerHandler,
  TriggerPayload,
  TriggerConfig,
  DmKeywordTriggerConfig,
} from '../../interfaces';
import { getEventDataString } from '../../utils';

@Injectable()
export class DmReceivedHandler implements TriggerHandler {
  canHandle(triggerType: AutomationTriggerType): boolean {
    return (
      triggerType === AutomationTriggerType.DM_KEYWORD ||
      triggerType === AutomationTriggerType.MESSAGE_RECEIVED
    );
  }

  matches(triggerConfig: TriggerConfig, payload: TriggerPayload): boolean {
    if (payload.triggerType === AutomationTriggerType.MESSAGE_RECEIVED) {
      return true;
    }

    const config = triggerConfig as DmKeywordTriggerConfig;
    const messageText = getEventDataString(payload.eventData, 'messageText');
    const { keywords, matchMode = KeywordMatchMode.ANY, caseSensitive = false } = config;

    const text = caseSensitive ? messageText : messageText.toLowerCase();
    const normalizedKeywords = caseSensitive ? keywords : keywords.map((k) => k.toLowerCase());

    if (matchMode === KeywordMatchMode.ALL) {
      return normalizedKeywords.every((kw) => text.includes(kw));
    }

    return normalizedKeywords.some((kw) => text.includes(kw));
  }
}
