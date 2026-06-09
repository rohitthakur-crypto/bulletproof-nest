import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { authTokenResponseSchema } from './auth-token.response.dto';

import { userResponseSchema } from '@/modules/users';
import { workspaceResponseSchema } from '@/modules/workspace';

export const userAuthResponseSchema = z
  .object({
    user: userResponseSchema,
    workspace: workspaceResponseSchema.optional(),
    tokens: authTokenResponseSchema,
  })
  .strict();

export type UserAuthResponse = z.infer<typeof userAuthResponseSchema>;

export class UserAuthResponseDto extends createZodDto(userAuthResponseSchema) {}
