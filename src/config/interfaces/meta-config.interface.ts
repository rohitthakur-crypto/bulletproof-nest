export interface MetaFacebookConfig {
  readonly baseUrl: string;
  readonly version: string;
}

export interface MetaGraphConfig {
  readonly baseUrl: string;
  readonly version: string;
}

export interface MetaOAuthScopesConfig {
  readonly facebook: string[];
  readonly instagram: string[];
  readonly whatsapp: string[];
}

export interface MetaOAuthConfig {
  readonly redirectUri: string;
  readonly successRedirectUri?: string;
  readonly scopes: MetaOAuthScopesConfig;
}

export interface MetaWebhookConfig {
  readonly verifyToken: string;
  readonly path: string;
}

export interface MetaWhatsAppConfig {
  readonly configId?: string;
}

export interface MetaConfig {
  readonly appId: string;
  readonly appSecret: string;
  readonly facebook: MetaFacebookConfig;
  readonly graph: MetaGraphConfig;
  readonly oauth: MetaOAuthConfig;
  readonly webhook: MetaWebhookConfig;
  readonly whatsapp: MetaWhatsAppConfig;
}
