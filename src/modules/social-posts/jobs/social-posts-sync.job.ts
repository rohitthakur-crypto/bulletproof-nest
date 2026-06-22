import { SOCIAL_POSTS_SYNC_JOB_NAME } from '../constants';

// TODO: Implement social-posts-sync background job using BullMQ when job infrastructure is ready.
//
// Intended behavior:
//   1. Iterate all active SocialAccounts with valid credentials
//   2. For each account call SocialPostsService.refreshPosts(workspaceId, accountId)
//   3. Upsert posts and update lastSeenAt
//
// Job name: SOCIAL_POSTS_SYNC_JOB_NAME = '${SOCIAL_POSTS_SYNC_JOB_NAME}'
//
// Example registration (BullMQ):
//   @Processor(SOCIAL_POSTS_SYNC_JOB_NAME)
//   export class SocialPostsSyncProcessor extends WorkerHost {
//     async process(job: Job<SocialPostsSyncPayload>): Promise<void> { ... }
//   }

export const SOCIAL_POSTS_SYNC_JOB = SOCIAL_POSTS_SYNC_JOB_NAME;
