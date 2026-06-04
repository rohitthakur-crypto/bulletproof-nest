import type { ArgumentsHost, ExecutionContext } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

export interface RequestContext {
  requestId: string;
  path: string;
}

export function getRequestContextFromExecution(context: ExecutionContext): RequestContext {
  const request = context.switchToHttp().getRequest<FastifyRequest>();

  return getRequestContextFromRequest(request);
}

export function getRequestContextFromHost(host: ArgumentsHost): RequestContext {
  const request = host.switchToHttp().getRequest<FastifyRequest>();

  return getRequestContextFromRequest(request);
}

export function getRequestContextFromRequest(request: FastifyRequest): RequestContext {
  const rawUrl = request.url ?? '/';
  const path = rawUrl.split('?')[0] ?? '/';

  return {
    requestId: String(request.id ?? 'unknown'),
    path,
  };
}

export function resolveHttpStatusFromContext(context: ExecutionContext, fallback = 200): number {
  const response = context.switchToHttp().getResponse<FastifyReply>();
  const statusCode = response.statusCode ?? fallback;

  return statusCode >= 100 && statusCode < 600 ? statusCode : fallback;
}
