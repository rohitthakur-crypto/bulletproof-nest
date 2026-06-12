import { registerAs } from '@nestjs/config';

import type { JwtConfig } from '../interfaces';
import { getValidatedEnv } from '../validation/validate-env';

export const jwtConfig = registerAs('jwt', (): JwtConfig => {
  const e = getValidatedEnv();

  return {
    user: {
      access: {
        expiresIn: e.USER_ACCESS_TOKEN_EXPIRES_IN,
        privateKey: e.USER_ACCESS_PRIVATE_KEY,
        publicKey: e.USER_ACCESS_PUBLIC_KEY,
      },
      refresh: {
        expiresIn: e.USER_REFRESH_TOKEN_EXPIRES_IN,
        privateKey: e.USER_REFRESH_PRIVATE_KEY,
        publicKey: e.USER_REFRESH_PUBLIC_KEY,
      },
      passwordReset: {
        expiresIn: e.USER_PASSWORD_RESET_TOKEN_EXPIRES_IN,
        privateKey: e.USER_PASSWORD_RESET_PRIVATE_KEY,
        publicKey: e.USER_PASSWORD_RESET_PUBLIC_KEY,
      },
      emailVerification: {
        expiresIn: e.USER_EMAIL_VERIFICATION_TOKEN_EXPIRES_IN,
        privateKey: e.USER_EMAIL_VERIFICATION_PRIVATE_KEY,
        publicKey: e.USER_EMAIL_VERIFICATION_PUBLIC_KEY,
      },
    },

    admin: {
      access: {
        expiresIn: e.ADMIN_ACCESS_TOKEN_EXPIRES_IN,
        privateKey: e.ADMIN_ACCESS_PRIVATE_KEY,
        publicKey: e.ADMIN_ACCESS_PUBLIC_KEY,
      },
      refresh: {
        expiresIn: e.ADMIN_REFRESH_TOKEN_EXPIRES_IN,
        privateKey: e.ADMIN_REFRESH_PRIVATE_KEY,
        publicKey: e.ADMIN_REFRESH_PUBLIC_KEY,
      },
      passwordReset: {
        expiresIn: e.ADMIN_PASSWORD_RESET_TOKEN_EXPIRES_IN,
        privateKey: e.ADMIN_PASSWORD_RESET_PRIVATE_KEY,
        publicKey: e.ADMIN_PASSWORD_RESET_PUBLIC_KEY,
      },
    },

    meta: {
      state: {
        expiresIn: e.META_OAUTH_STATE_TOKEN_EXPIRES_IN,
        privateKey: e.META_OAUTH_STATE_PRIVATE_KEY,
        publicKey: e.META_OAUTH_STATE_PUBLIC_KEY,
      },
    },
  };
});
