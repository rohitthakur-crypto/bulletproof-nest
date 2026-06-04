import type { ArgumentsHost, ExecutionContext } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

export interface RequestContext {
  requestId: string;
  path: string;
}

export function extractFromExecution(context: ExecutionContext): RequestContext {
  const request = context.switchToHttp().getRequest<FastifyRequest>();
  return extractFromRequest(request);
}

export function extractFromHost(host: ArgumentsHost): RequestContext {
  const request = host.switchToHttp().getRequest<FastifyRequest>();
  return extractFromRequest(request);
}

export function extractFromRequest(request: FastifyRequest): RequestContext {
  const rawUrl = request.url ?? '/';
  return {
    requestId: String(request.id ?? 'unknown'),
    path: rawUrl.split('?')[0] ?? '/',
  };
}

export function resolveStatusCode(context: ExecutionContext, fallback = 200): number {
  const response = context.switchToHttp().getResponse<FastifyReply>();
  const code = response.statusCode ?? fallback;
  return code >= 100 && code < 600 ? code : fallback;
}
