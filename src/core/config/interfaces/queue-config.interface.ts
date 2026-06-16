export interface QueueConfig {
  readonly prefix: string;
  readonly redis: {
    readonly host: string;
    readonly port: number;
    readonly password: string;
    readonly tls: boolean;
  };
}
