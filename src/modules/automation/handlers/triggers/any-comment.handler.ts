import { Injectable } from '@nestjs/common';
import { AutomationTriggerType } from '@prisma/client';

import type {
  TriggerHandler,
  TriggerPayload,
  TriggerConfig,
  AnyCommentTriggerConfig,
} from '../../interfaces';
import { getEventDataString } from '../../utils';

@Injectable()
export class AnyCommentHandler implements TriggerHandler {
  canHandle(triggerType: AutomationTriggerType): boolean {
    return triggerType === AutomationTriggerType.COMMENT_CREATED;
  }

  matches(triggerConfig: TriggerConfig, payload: TriggerPayload): boolean {
    const config = triggerConfig as AnyCommentTriggerConfig;

    if (config.socialPostId) {
      const postId = getEventDataString(payload.eventData, 'postId');
      return postId === config.socialPostId;
    }

    return true;
  }
}
