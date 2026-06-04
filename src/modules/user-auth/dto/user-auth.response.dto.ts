import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { authTokenResponseSchema } from './auth-token.response.dto';
import { userResponseSchema } from './user.response.dto';

export const userAuthResponseSchema = z
  .object({
    user: userResponseSchema,
    tokens: authTokenResponseSchema,
  })
  .strict();

export type UserAuthResponse = z.infer<typeof userAuthResponseSchema>;

export class UserAuthResponseDto extends createZodDto(userAuthResponseSchema) {}
