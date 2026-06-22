export interface InstagramChildMedia {
  id: string;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  timestamp?: string;
}

export interface InstagramPost {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  username?: string;
  like_count?: number;
  comments_count?: number;
  is_shared_to_feed?: boolean;
  shortcode?: string;
  ig_id?: string;
  children?: { data: InstagramChildMedia[] };
}
