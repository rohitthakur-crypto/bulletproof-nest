export const META_GRAPH_OAUTH_PATH = 'dialog/oauth';
export const META_GRAPH_OAUTH_ACCESS_TOKEN_PATH = 'oauth/access_token';
export const META_GRAPH_ME_ACCOUNTS_PATH = 'me/accounts';

export const META_GRAPH_PAGE_SUBSCRIBED_APPS_PATH = (pageId: string) => `${pageId}/subscribed_apps`;

export const META_GRAPH_PAGE_PATH = (pageId: string) => pageId;

export const META_GRAPH_INSTAGRAM_ACCOUNT_PATH = (instagramBusinessId: string) =>
  `instagram-business-accounts/${instagramBusinessId}`;
