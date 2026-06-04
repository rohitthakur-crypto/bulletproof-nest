import type { ServerResponse } from 'node:http';

import type { FastifyReply } from 'fastify';

type ExpressLikeResponse = {
  status: (code: number) => { send: (body: unknown) => void };
};

/** NestJS + Fastify route middleware uses middie (Express req/res), not FastifyReply. */
export function resolveServerResponse(response: FastifyReply | ServerResponse): ServerResponse {
  if ('raw' in response && response.raw) {
    return response.raw;
  }

  return response as ServerResponse;
}

export function sendJsonResponse(
  response: FastifyReply | ExpressLikeResponse | ServerResponse,
  statusCode: number,
  payload: unknown,
): void {
  if (
    typeof response === 'object' &&
    response !== null &&
    'code' in response &&
    typeof response.code === 'function'
  ) {
    response.code(statusCode).send(payload);
    return;
  }

  if (
    typeof response === 'object' &&
    response !== null &&
    'status' in response &&
    typeof response.status === 'function'
  ) {
    response.status(statusCode).send(payload);
    return;
  }

  const serverResponse = response as ServerResponse;
  serverResponse.statusCode = statusCode;
  serverResponse.setHeader('Content-Type', 'application/json');
  serverResponse.end(JSON.stringify(payload));
}
