export interface MetaSubscribeAppsResponse {
  success: boolean;
}

export interface MetaSubscribedApp {
  id: string;
  name?: string;
  subscribed_fields?: string[];
}

export interface MetaSubscribedAppsResponse {
  data: MetaSubscribedApp[];
}
