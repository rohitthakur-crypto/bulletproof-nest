export interface CommentKeywordTriggerConfig {
  socialPostId: string;
  keywords: string[];
  matchMode?: 'ANY' | 'ALL';
  caseSensitive?: boolean;
}

export interface DmKeywordTriggerConfig {
  keywords: string[];
  matchMode?: 'ANY' | 'ALL';
  caseSensitive?: boolean;
}

export interface AnyCommentTriggerConfig {
  socialPostId?: string;
}

export interface StoryMentionTriggerConfig {
  replyEnabled?: boolean;
}

export type MessageReceivedTriggerConfig = Record<string, never>;

export type MentionTriggerConfig = Record<string, never>;

export interface WebhookTriggerConfig {
  externalUrl?: string;
}

export type ManualTriggerConfig = Record<string, never>;

export type TriggerConfig =
  | CommentKeywordTriggerConfig
  | DmKeywordTriggerConfig
  | AnyCommentTriggerConfig
  | StoryMentionTriggerConfig
  | MessageReceivedTriggerConfig
  | MentionTriggerConfig
  | WebhookTriggerConfig
  | ManualTriggerConfig;
