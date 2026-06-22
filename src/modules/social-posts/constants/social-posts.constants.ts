export const SOCIAL_POSTS_FETCH_LIMIT = 25 as const;

export const SOCIAL_POSTS_DEFAULT_PAGE = 1 as const;
export const SOCIAL_POSTS_DEFAULT_LIMIT = 25 as const;
export const SOCIAL_POSTS_MAX_LIMIT = 100 as const;

export const SOCIAL_POSTS_SYNC_JOB_NAME = 'social-posts-sync' as const;

export const FACEBOOK_POST_FIELDS = 'id,message,full_picture,permalink_url,created_time' as const;

export const INSTAGRAM_POST_FIELDS =
  'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp' as const;

export const IG_MEDIA_TYPE_MAP: Record<string, string> = {
  IMAGE: 'image',
  VIDEO: 'video',
  CAROUSEL_ALBUM: 'carousel',
  REELS: 'reel',
  STORIES: 'story',
};
