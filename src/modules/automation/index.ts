export { AutomationModule } from './automation.module';

export type {
  AutomationResponse,
  AutomationDetailResponse,
  AutomationExecutionResponse,
  PaginatedAutomationsResponse,
  PaginatedExecutionsResponse,
} from './dto/responses';

export type {
  TriggerPayload,
  AutomationJobPayload,
  AutomationContext,
  FlowNode,
  FlowData,
  TriggerConfig,
} from './interfaces';

export { AutomationActionType } from './enums';
