export interface RedisConfig {
  readonly host: string;
  readonly port: number;
  readonly password: string;
  readonly tls: boolean;
  readonly db: number;
}
