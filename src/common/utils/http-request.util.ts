import type { IncomingMessage } from 'node:http';

import type { FastifyRequest } from 'fastify';

export function resolveIncomingMessage(request: FastifyRequest | IncomingMessage): IncomingMessage {
  if ('raw' in request && request.raw) {
    return request.raw;
  }

  return request as IncomingMessage;
}

export function resolveRequestId(request: FastifyRequest | IncomingMessage): string {
  if ('id' in request && request.id != null) {
    return typeof request.id === 'string' ? request.id : JSON.stringify(request.id);
  }

  return 'unknown';
}
