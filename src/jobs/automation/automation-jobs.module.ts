import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { AUTOMATION_QUEUES } from './constants';
import { AutomationActionProcessor } from './processors/automation-action.processor';
import { AutomationTriggerProcessor } from './processors/automation-trigger.processor';
import { AutomationActionProducer } from './producers/automation-action.producer';
import { AutomationTriggerProducer } from './producers/automation-trigger.producer';
import { ActionExecutorService } from './services/action-executor.service';
import { WorkflowEngineService } from './services/workflow-engine.service';

import { AutomationModule } from '@/modules/automation';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: AUTOMATION_QUEUES.TRIGGER },
      { name: AUTOMATION_QUEUES.ACTION },
    ),
    AutomationModule,
  ],

  providers: [
    AutomationTriggerProducer,
    AutomationActionProducer,
    AutomationTriggerProcessor,
    AutomationActionProcessor,
    WorkflowEngineService,
    ActionExecutorService,
  ],

  exports: [AutomationTriggerProducer, AutomationActionProducer],
})
export class AutomationJobModule {}
