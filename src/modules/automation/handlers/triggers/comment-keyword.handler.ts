import { Injectable } from '@nestjs/common';
import { AutomationTriggerType } from '@prisma/client';

import { KeywordMatchMode } from '../../enums';
import type {
  TriggerHandler,
  TriggerPayload,
  TriggerConfig,
  CommentKeywordTriggerConfig,
} from '../../interfaces';
import { getEventDataString } from '../../utils';

@Injectable()
export class CommentKeywordHandler implements TriggerHandler {
  canHandle(triggerType: AutomationTriggerType): boolean {
    return triggerType === AutomationTriggerType.COMMENT_KEYWORD;
  }

  matches(triggerConfig: TriggerConfig, payload: TriggerPayload): boolean {
    const config = triggerConfig as CommentKeywordTriggerConfig;
    const commentText = getEventDataString(payload.eventData, 'commentText');
    const { keywords, matchMode = KeywordMatchMode.ANY, caseSensitive = false } = config;

    const text = caseSensitive ? commentText : commentText.toLowerCase();
    const normalizedKeywords = caseSensitive ? keywords : keywords.map((k) => k.toLowerCase());

    if (matchMode === KeywordMatchMode.ALL) {
      return normalizedKeywords.every((kw) => text.includes(kw));
    }

    return normalizedKeywords.some((kw) => text.includes(kw));
  }
}
