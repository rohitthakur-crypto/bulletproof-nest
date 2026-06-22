export interface FlowNode {
  id: string;
  type: string;
  config: Record<string, unknown>;
  nextNodeId?: string;
}

export interface FlowData {
  nodes: FlowNode[];
  version?: string;
}
