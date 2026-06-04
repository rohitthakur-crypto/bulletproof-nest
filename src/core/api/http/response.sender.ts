import type { ServerResponse } from 'node:http';

import type { FastifyReply } from 'fastify';

export function sendJson(reply: FastifyReply, statusCode: number, body: unknown): void {
  if (typeof reply.code === 'function') {
    reply.code(statusCode).send(body);
    return;
  }

  const raw = (reply as unknown as { raw?: ServerResponse }).raw ?? reply;
  sendRaw(raw as ServerResponse, statusCode, body);
}

function sendRaw(res: ServerResponse, statusCode: number, body: unknown): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}
