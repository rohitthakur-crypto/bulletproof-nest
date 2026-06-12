import type { User } from '@prisma/client';

import type { UserResponse } from '../dto';

import { toIsoString } from '@/common/utils';

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar ?? undefined,
    isEmailVerified: user.isEmailVerified,
    lastActiveAt: toIsoString(user.lastActiveAt),
    createdAt: toIsoString(user.createdAt)!,
    updatedAt: toIsoString(user.updatedAt)!,
  };
}
