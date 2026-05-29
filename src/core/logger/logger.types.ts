export type LogMetadata = Record<string, unknown>;

export type LogBindings = {
  context?: string;
  correlationId?: string;
  userId?: string;
  [key: string]: unknown;
};

export type LogErrorPayload = {
  name: string;
  message: string;
  stack?: string;
  code?: string | number;
};
