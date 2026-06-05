import { FastifyRequest } from 'fastify';

export interface AuthenticatedUser {
  userId: string;
  sessionId: string;
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: AuthenticatedUser;
}
