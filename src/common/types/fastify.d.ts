import 'fastify';
import type { Logger } from 'pino';

declare module 'fastify' {
  interface FastifyRequest {
    /** Assigned by nestjs-pino `genReqId`. */
    id?: string;
    /** Pino child logger attached by nestjs-pino. */
    log?: Logger;
    /** Set by `JwtAuthGuard` after Bearer token validation. */
    user?: {
      userId: string;
      email?: string;
    };
    /**
     * Raw request body Buffer — populated by the `addContentTypeParser` hook
     * registered in `setupFastify`.  Required for HMAC webhook signature
     * verification (e.g. X-Hub-Signature-256).
     */
    rawBody?: Buffer;
  }
}

export {};
