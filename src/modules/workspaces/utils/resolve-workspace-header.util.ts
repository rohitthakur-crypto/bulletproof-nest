import type { FastifyRequest } from 'fastify';

import { X_WORKSPACE_ID_HEADER } from '../constants/workspace-header.constant';

export function resolveWorkspaceIdFromHeader(request: FastifyRequest): string | undefined {
  const headerValue = request.headers[X_WORKSPACE_ID_HEADER];
  const workspaceId = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  return workspaceId?.trim() || undefined;
}
