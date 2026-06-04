import { registerAs } from '@nestjs/config';

import { env } from '../validation/validate-env';

export interface JwtKeyPairConfig {
  expiresIn: string;
  privateKey: string;
  publicKey: string;
}

export interface UserJwtConfig {
  access: JwtKeyPairConfig;
  refresh: JwtKeyPairConfig;
  passwordReset: JwtKeyPairConfig;
  emailVerification: JwtKeyPairConfig;
}

export interface AdminJwtConfig {
  access: JwtKeyPairConfig;
  refresh: JwtKeyPairConfig;
  passwordReset: JwtKeyPairConfig;
}

export interface JwtConfig {
  user: UserJwtConfig;
  admin: AdminJwtConfig;
}

export const jwtConfig = registerAs('jwt', (): JwtConfig => {
  const e = env();

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
  };
});

export type JwtConfigType = JwtConfig;
