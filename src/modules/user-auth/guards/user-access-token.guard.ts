import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '../interfaces';

import { AuthActorType } from '@/common/enums';
import { AccessTokenPayload, JwtVerifierService, TokenType } from '@/core/jwt';

@Injectable()
export class UserAccessTokenGuard implements CanActivate {
  constructor(private readonly jwtVerifierService: JwtVerifierService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    const payload = await this.jwtVerifierService.verify<AccessTokenPayload>(
      token,
      AuthActorType.USER,
      TokenType.ACCESS,
    );

    if (!payload) {
      throw new UnauthorizedException('Unauthorized');
    }

    request.user = {
      userId: payload.sub,
      sessionId: payload.sessionId,
    };

    return true;
  }

  private extractToken(request: FastifyRequest) {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return null;
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}
