import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import type {
  MetaBuildConnectResult,
  MetaConnectFailure,
  MetaPageConnectData,
  MetaPageSelection,
} from '../interfaces';
import { buildMetaPageConnectData, findMetaPageById } from '../utils';

import { MetaService } from './meta.service';

import type { AuthenticatedUser } from '@/modules/user-auth/interfaces';

@Injectable()
export class MetaConnectService {
  constructor(private readonly metaService: MetaService) {}

  /**
   * Resolves the user's Meta pages from the OAuth session, subscribes each
   * selected page to webhooks (and verifies the subscription), then maps the
   * results to normalised MetaPageConnectData objects ready for persistence.
   *
   * Per-page failures are collected rather than thrown so the caller can
   * perform a partial-success connect and report back accurately.
   */
  public async buildConnectPayloads(
    user: AuthenticatedUser,
    workspaceId: string,
    selections: MetaPageSelection[],
  ): Promise<MetaBuildConnectResult> {
    const metaPages = await this.metaService.resolveAssetsForConnect(user, workspaceId);

    const payloads: MetaPageConnectData[] = [];
    const failures: MetaConnectFailure[] = [];

    for (const selection of selections) {
      try {
        const page = findMetaPageById(metaPages, selection.pageId);

        const webhookFields = await this.metaService.subscribeAndVerifyPageWebhooks(
          page.id,
          page.access_token!,
        );

        const subscribedAt = new Date();

        payloads.push(...buildMetaPageConnectData(page, selection, webhookFields, subscribedAt));
      } catch (error) {
        failures.push(this.toConnectFailure(selection.pageId, error));
      }
    }

    return { payloads, failures };
  }

  /**
   * Clears the short-lived OAuth session from cache after a successful connect.
   * Should be called once at least one account has been persisted.
   */
  public async clearConnectSession(sessionId: string, workspaceId: string): Promise<void> {
    await this.metaService.clearOAuthSession(sessionId, workspaceId);
  }

  // ─── Private ─────────────────────────────────────────────────────────────────

  private toConnectFailure(pageId: string, error: unknown): MetaConnectFailure {
    if (error instanceof NotFoundException) {
      return { pageId, reason: 'page_not_found', message: error.message };
    }

    if (error instanceof BadRequestException) {
      const response = error.getResponse();

      return {
        pageId,
        reason: 'validation_failed',
        message: typeof response === 'string' ? response : error.message,
      };
    }

    return {
      pageId,
      reason: 'connect_failed',
      message: 'Unexpected error while preparing this page',
    };
  }
}
