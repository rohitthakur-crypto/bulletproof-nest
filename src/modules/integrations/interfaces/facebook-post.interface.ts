export interface FacebookPostImage {
  src: string;
  width: number;
  height: number;
}

export interface FacebookPostAttachmentMedia {
  image?: FacebookPostImage;
  source?: string;
}

export interface FacebookPostAttachment {
  type?: string;
  media_type: string;
  media?: FacebookPostAttachmentMedia;
  url?: string;
  title?: string;
  description?: string;
  subattachments?: {
    data: Omit<FacebookPostAttachment, 'subattachments'>[];
  };
}

interface FacebookEngagementSummary {
  total_count: number;
  can_comment?: boolean;
  viewer_has_liked?: boolean;
}

interface FacebookEngagement<T = unknown> {
  data: T[];
  summary?: FacebookEngagementSummary;
}

export interface FacebookPost {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  updated_time?: string;
  permalink_url: string;
  full_picture?: string;
  picture?: string;
  attachments?: { data: FacebookPostAttachment[] };
  link?: string;
  name?: string;
  description?: string;
  type?: string;
  status_type?: string;
  shares?: { count: number };
  reactions?: FacebookEngagement;
  comments?: FacebookEngagement;
}
