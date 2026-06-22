import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { paginationMetaSchema } from '@/common/validators';

// ─── Single post response ─────────────────────────────────────────────────────

export const socialPostResponseSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  socialAccountId: z.string(),
  platform: z.string(),
  platformPostId: z.string(),
  caption: z.string().optional(),
  mediaType: z.string().optional(),
  mediaUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  permalink: z.string().optional(),
  publishedAt: z.string().datetime().optional(),
  lastSeenAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SocialPostResponse = z.infer<typeof socialPostResponseSchema>;

export class SocialPostResponseDto extends createZodDto(socialPostResponseSchema) {}

// ─── Sync state fragment ──────────────────────────────────────────────────────

export const syncStateSchema = z.object({
  hasMoreRemote: z.boolean(),
  lastSyncedAt: z.string().datetime().optional(),
});

export type SyncState = z.infer<typeof syncStateSchema>;

// ─── List posts response ──────────────────────────────────────────────────────

export const listSocialPostsResponseSchema = z.object({
  data: z.array(socialPostResponseSchema),
  pagination: paginationMetaSchema,
  sync: syncStateSchema,
});

export type ListSocialPostsResponse = z.infer<typeof listSocialPostsResponseSchema>;

export class ListSocialPostsResponseDto extends createZodDto(listSocialPostsResponseSchema) {}

// ─── Sync older response ──────────────────────────────────────────────────────

export const syncOlderPostsResponseSchema = z.object({
  data: z.array(socialPostResponseSchema),
  sync: syncStateSchema,
});

export type SyncOlderPostsResponse = z.infer<typeof syncOlderPostsResponseSchema>;

export class SyncOlderPostsResponseDto extends createZodDto(syncOlderPostsResponseSchema) {}
