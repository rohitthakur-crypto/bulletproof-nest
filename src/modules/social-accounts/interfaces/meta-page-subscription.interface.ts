export interface MetaSubscribeAppsResponse {
  success: boolean;
}

export interface MetaSubscribedApp {
  id: string;
  name?: string;
  category?: string;
  link?: string;
  subscribed_fields?: string[];
}

export interface MetaSubscribedAppsResponse {
  data: MetaSubscribedApp[];
}

export interface MetaPageWebhookSubscription {
  subscribed: boolean;
  fields: string[];
}
