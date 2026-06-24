import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import {
  AUTOMATION_FLOW_MAX_NODES,
  AUTOMATION_KEYWORD_MAX_COUNT,
  AUTOMATION_KEYWORD_MAX_LENGTH,
} from '../constants';
import { KeywordMatchMode } from '../enums';

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

export const flowNodeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  config: z.record(z.string(), z.unknown()).default({}),
  nextNodeId: z.string().optional(),
});

export const flowDataSchema = z.object({
  nodes: z.array(flowNodeSchema).min(1).max(AUTOMATION_FLOW_MAX_NODES),
  version: z.string().optional(),
});

const keywordListSchema = z
  .array(z.string().min(1).max(AUTOMATION_KEYWORD_MAX_LENGTH))
  .min(1)
  .max(AUTOMATION_KEYWORD_MAX_COUNT);

const matchModeSchema = z.enum(KeywordMatchMode).default(KeywordMatchMode.ANY);

// ─── Trigger config discriminated union ───────────────────────────────────────

export const commentKeywordTriggerConfigSchema = z.object({
  socialPostId: z.string().uuid(),
  keywords: keywordListSchema,
  matchMode: matchModeSchema,
  caseSensitive: z.boolean().default(false),
});

export const dmKeywordTriggerConfigSchema = z.object({
  keywords: keywordListSchema,
  matchMode: matchModeSchema,
  caseSensitive: z.boolean().default(false),
});

export const anyCommentTriggerConfigSchema = z.object({
  socialPostId: z.string().uuid().optional(),
});

export const storyMentionTriggerConfigSchema = z.object({
  replyEnabled: z.boolean().default(false),
});

export const messageReceivedTriggerConfigSchema = z.object({});

export const mentionTriggerConfigSchema = z.object({});

export const webhookTriggerConfigSchema = z.object({
  externalUrl: z.string().url().optional(),
});

export const manualTriggerConfigSchema = z.object({});

export const triggerConfigSchema = z.union([
  commentKeywordTriggerConfigSchema,
  dmKeywordTriggerConfigSchema,
  anyCommentTriggerConfigSchema,
  storyMentionTriggerConfigSchema,
  messageReceivedTriggerConfigSchema,
  mentionTriggerConfigSchema,
  webhookTriggerConfigSchema,
  manualTriggerConfigSchema,
]);

// ─── Create automation schema ─────────────────────────────────────────────────

export const createAutomationSchema = z
  .object({
    socialAccountId: z.string().uuid(),
    name: z.string().min(1).max(255).trim(),
    description: z.string().max(1000).trim().optional(),
    triggerType: z.enum([
      'COMMENT_KEYWORD',
      'DM_KEYWORD',
      'STORY_MENTION',
      'WEBHOOK',
      'COMMENT_CREATED',
      'MESSAGE_RECEIVED',
      'MENTION_CREATED',
      'MANUAL',
    ]),
    triggerConfig: z.record(z.string(), z.unknown()),
    flowData: flowDataSchema.optional(),
    isAiEnabled: z.boolean().default(false),
  })
  .strict();

export type CreateAutomationType = z.infer<typeof createAutomationSchema>;

export class CreateAutomationDto extends createZodDto(createAutomationSchema) {}
