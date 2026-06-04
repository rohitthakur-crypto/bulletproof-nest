import type { User } from '@prisma/client';

import type { UserResponse } from '../dto/user.response.dto';

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar ?? undefined,
    isEmailVerified: user.isEmailVerified,
    lastActiveAt: user.lastActiveAt?.toISOString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
