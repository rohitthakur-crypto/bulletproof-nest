import { Module } from '@nestjs/common';

import { AutomationsController, AutomationExecutionsController } from './controllers';
import { AddTagHandler } from './handlers/actions/add-tag.handler';
import { AiReplyHandler } from './handlers/actions/ai-reply.handler';
import { DelayHandler } from './handlers/actions/delay.handler';
import { SendMessageHandler } from './handlers/actions/send-message.handler';
import { WebhookActionHandler } from './handlers/actions/webhook.handler';
import { AnyCommentHandler } from './handlers/triggers/any-comment.handler';
import { CommentKeywordHandler } from './handlers/triggers/comment-keyword.handler';
import { DmReceivedHandler } from './handlers/triggers/dm-received.handler';
import { MentionHandler } from './handlers/triggers/mention.handler';
import { AutomationExecutionRepository } from './repositories/automation-execution.repository';
import { AutomationRepository } from './repositories/automation.repository';
import { AutomationExecutionService } from './services/automation-execution.service';
import { AutomationPublishService } from './services/automation-publish.service';
import { AutomationQueryService } from './services/automation-query.service';
import { AutomationTriggerService } from './services/automation-trigger.service';
import { AutomationWorkerService } from './services/automation-worker.service';
import { AutomationService } from './services/automation.service';
import { MetaDmService } from './services/meta-dm.service';

import { EncryptionModule } from '@/core/security/encryption';
import { HttpModule } from '@/infra/http';
import { SocialAccountsRepository } from '@/modules/social-accounts/repositories/social-accounts.repository';
import { SocialCredentialsRepository } from '@/modules/social-accounts/repositories/social-credentials.repository';
import { UserAuthModule } from '@/modules/user-auth';
import { WorkspaceModule } from '@/modules/workspaces';

@Module({
  imports: [UserAuthModule, WorkspaceModule, HttpModule, EncryptionModule],
  controllers: [AutomationsController, AutomationExecutionsController],
  providers: [
    AutomationRepository,
    AutomationExecutionRepository,
    SocialAccountsRepository,
    SocialCredentialsRepository,

    CommentKeywordHandler,
    AnyCommentHandler,
    DmReceivedHandler,
    MentionHandler,

    SendMessageHandler,
    DelayHandler,
    AiReplyHandler,
    AddTagHandler,
    WebhookActionHandler,

    AutomationService,
    AutomationQueryService,
    AutomationPublishService,
    AutomationTriggerService,
    AutomationExecutionService,
    AutomationWorkerService,
    MetaDmService,
  ],
  exports: [
    AutomationService,
    AutomationQueryService,
    AutomationTriggerService,
    AutomationExecutionService,
    AutomationWorkerService,
    MetaDmService,
  ],
})
export class AutomationModule {}
