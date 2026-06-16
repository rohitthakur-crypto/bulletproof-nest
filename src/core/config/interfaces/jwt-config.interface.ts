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

export interface MetaOauthJwtConfig {
  state: JwtKeyPairConfig;
}

export interface JwtConfig {
  user: UserJwtConfig;
  admin: AdminJwtConfig;
  meta: MetaOauthJwtConfig;
}
