import { FastifyRequest } from 'fastify';

export interface AuthenticatedUser {
  userId: string;
  sessionId: string;
  workspaceId?: string;
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: AuthenticatedUser;
}
