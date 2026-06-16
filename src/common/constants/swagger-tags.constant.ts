export const SWAGGER_TAGS = {
  HEALTH: 'Health',
  USER_AUTH: 'User Auth',
  USERS: 'Users',
  WORKSPACES: 'Workspaces',
  META: 'Meta',
  SOCIAL_ACCOUNTS: 'Social Accounts',
  WEBHOOKS: 'Webhooks',
} as const;

export type SwaggerTag = (typeof SWAGGER_TAGS)[keyof typeof SWAGGER_TAGS];

export const SWAGGER_TAG_DESCRIPTIONS: Readonly<Record<SwaggerTag, string>> = {
  [SWAGGER_TAGS.HEALTH]: 'Health checks and probes',
  [SWAGGER_TAGS.USER_AUTH]: 'Registration, login, and token management',
  [SWAGGER_TAGS.USERS]: 'User profile and account',
  [SWAGGER_TAGS.WORKSPACES]: 'Workspace management',
  [SWAGGER_TAGS.META]: 'Meta / Facebook OAuth and page management',
  [SWAGGER_TAGS.SOCIAL_ACCOUNTS]: 'Social accounts management',
  [SWAGGER_TAGS.WEBHOOKS]: 'Meta real-time webhook ingress',
};

export const SWAGGER_TAG_ORDER: readonly SwaggerTag[] = [
  SWAGGER_TAGS.HEALTH,
  SWAGGER_TAGS.USER_AUTH,
  SWAGGER_TAGS.USERS,
  SWAGGER_TAGS.WORKSPACES,
  SWAGGER_TAGS.META,
  SWAGGER_TAGS.SOCIAL_ACCOUNTS,
  SWAGGER_TAGS.WEBHOOKS,
];
