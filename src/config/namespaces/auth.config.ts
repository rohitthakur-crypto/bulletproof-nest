import { registerAs } from '@nestjs/config';

import { env } from '../validation/validate-env';

export const authConfig = registerAs('auth', () => {
  const e = env();

  return {
    jwtSecret: e.JWT_SECRET,

    jwtExpiresIn: e.JWT_EXPIRES_IN,

    refreshSecret: e.REFRESH_SECRET,

    refreshExpiresIn: e.REFRESH_EXPIRES_IN,
  } as const;
});

export type AuthConfig = ReturnType<typeof authConfig>;
