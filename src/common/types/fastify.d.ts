import 'fastify';
import type { Logger } from 'pino';

declare module 'fastify' {
  interface FastifyRequest {
    /** Assigned by nestjs-pino `genReqId`. */
    id?: string;
    /** Pino child logger attached by nestjs-pino. */
    log?: Logger;
  }
}

export {};
