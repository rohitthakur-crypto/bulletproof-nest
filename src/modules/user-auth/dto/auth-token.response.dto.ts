import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const authTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type AuthTokenResponse = z.infer<typeof authTokenResponseSchema>;

export class AuthTokenResponseDto extends createZodDto(authTokenResponseSchema) {}
