import { AutomationTriggerType } from '@prisma/client';

import { AutomationActionType } from '../enums';

import type { AutomationContext } from './automation-context.interface';
import type { TriggerPayload } from './automation-context.interface';
import type { FlowNode } from './flow-data.interface';
import type { TriggerConfig } from './trigger-config.interface';

export interface ActionHandler {
  canHandle(nodeType: AutomationActionType): boolean;
  execute(node: FlowNode, context: AutomationContext): Promise<void>;
}

export interface TriggerHandler {
  canHandle(triggerType: AutomationTriggerType): boolean;
  matches(triggerConfig: TriggerConfig, payload: TriggerPayload): boolean;
}
