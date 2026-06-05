import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthenticatedUser, AuthenticatedRequest } from '../interfaces';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
