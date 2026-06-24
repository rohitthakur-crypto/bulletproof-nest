import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { AUTOMATION_QUEUES } from './constants';
import { AutomationActionProcessor } from './processors/automation-action.processor';
import { AutomationExecutionProcessor } from './processors/automation-execution.processor';
import { AutomationTriggerProcessor } from './processors/automation-trigger.processor';
import { AutomationProducer } from './producers/automation.producer';
import { ActionExecutorService } from './services/action-executor.service';
import { WorkflowEngineService } from './services/workflow-engine.service';

import { AutomationModule } from '@/modules/automation';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: AUTOMATION_QUEUES.TRIGGER },
      { name: AUTOMATION_QUEUES.EXECUTION },
      { name: AUTOMATION_QUEUES.ACTION },
    ),
    AutomationModule,
  ],

  providers: [
    AutomationProducer,
    AutomationTriggerProcessor,
    AutomationExecutionProcessor,
    AutomationActionProcessor,
    WorkflowEngineService,
    ActionExecutorService,
  ],

  exports: [AutomationProducer],
})
export class AutomationJobModule {}
