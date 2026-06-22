import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const socialPostSchema = z.object({
  id: z.string(),
  socialAccountId: z.string(),
  platformPostId: z.string(),
  caption: z.string().optional(),
  mediaUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  permalink: z.string().optional(),
  publishedAt: z.string(),
});

export type SocialPost = z.infer<typeof socialPostSchema>;

export class SocialPostDto extends createZodDto(socialPostSchema) {}
