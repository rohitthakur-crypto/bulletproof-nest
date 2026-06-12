import type { Environment } from '@/common/enums';

export interface AppConfig {
  readonly env: Environment;
  readonly name: string;
  readonly host: string;
  readonly port: number;
  readonly apiPrefix: string;
  readonly apiVersion: string;
  readonly corsOrigins: string[];
  readonly requestTimeoutMs: number;
}
