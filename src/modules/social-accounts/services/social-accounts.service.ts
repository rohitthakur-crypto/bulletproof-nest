import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SocialAccountStatus, type Prisma } from '@prisma/client';

import type { PaginatedSocialAccountsResponse, SocialAccountResponse } from '../dto';
import type {
  CreateSocialAccountsConnectResponse,
  SocialAccountConnectFailure,
  SocialAccountConnectResult,
  SocialAccountUpsertPayload,
} from '../interfaces';
import { toSocialAccountResponse } from '../mappers';
import { SocialAccountsRepository } from '../repositories/social-accounts.repository';
import { SocialCredentialsRepository } from '../repositories/social-credentials.repository';
import type {
  CreateSocialAccountsType,
  GetSocialAccountsQuery,
  ListSocialAccountsFilters,
} from '../validators';

import { EncryptionService } from '@/core/security/encryption/encryption.service';
import {
  buildOffsetPaginationMeta,
  toPrismaOffset,
} from '@/infra/prisma/helpers/pagination.helper';
import type { MetaPageConnectData } from '@/modules/integrations/interfaces';
import { MetaConnectService } from '@/modules/integrations/services/meta-connect.service';
import type { AuthenticatedUser } from '@/modules/user-auth/interfaces';

@Injectable()
export class SocialAccountsService {
  constructor(
    private readonly metaConnectService: MetaConnectService,
    private readonly socialAccountRepo: SocialAccountsRepository,
    private readonly socialCredentialsRepo: SocialCredentialsRepository,
    private readonly encryptionService: EncryptionService,
  ) {}

  // ─── Public ───────────────────────────────────────────────────────────────────

  public async listSocialAccounts(
    workspaceId: string,
    query: GetSocialAccountsQuery,
  ): Promise<PaginatedSocialAccountsResponse> {
    const filters: ListSocialAccountsFilters = { workspaceId, ...query };
    const pagination = toPrismaOffset({ page: query.page, limit: query.limit });

    const [accounts, total] = await Promise.all([
      this.socialAccountRepo.findManyByWorkspace(filters, pagination),
      this.socialAccountRepo.countByWorkspace(filters),
    ]);

    return {
      items: accounts.map(toSocialAccountResponse),
      pagination: buildOffsetPaginationMeta({ page: query.page, limit: query.limit }, total),
    };
  }

  public async getSocialAccountById(
    workspaceId: string,
    id: string,
  ): Promise<SocialAccountResponse> {
    const account = await this.socialAccountRepo.findByIdAndWorkspace(id, workspaceId);

    if (!account) {
      throw new NotFoundException('Social account not found');
    }

    return toSocialAccountResponse(account);
  }

  /**
   * Validates the Meta OAuth session, subscribes each selected page to
   * webhooks, and persists the resulting social accounts.  Returns a
   * partial-success response so the client knows which pages connected and
   * which failed.
   */
  public async createSocialAccount(
    user: AuthenticatedUser,
    workspaceId: string,
    selections: CreateSocialAccountsType,
  ): Promise<CreateSocialAccountsConnectResponse> {
    const { payloads, failures: connectFailures } =
      await this.metaConnectService.buildConnectPayloads(user, workspaceId, selections);

    const connected: SocialAccountConnectResult[] = [];
    const failed: SocialAccountConnectFailure[] = connectFailures.map((f) => ({ ...f }));

    for (const data of payloads) {
      try {
        connected.push(await this.persistSocialAccount(workspaceId, data));
      } catch (error) {
        failed.push({
          pageId: data.metaPageId,
          reason: 'persist_failed',
          message: error instanceof Error ? error.message : 'Failed to save social account',
        });
      }
    }

    if (connected.length === 0) {
      throw new BadRequestException({
        message: 'Failed to connect any of the selected social accounts',
        failed,
      });
    }

    await this.metaConnectService.clearConnectSession(user.sessionId, workspaceId);

    return { connected, failed };
  }

  // ─── Private ──────────────────────────────────────────────────────────────────

  /**
   * Upserts a social account and its encrypted credential.
   * Maps MetaPageConnectData (from integrations) to the internal upsert payload.
   */
  private async persistSocialAccount(
    workspaceId: string,
    data: MetaPageConnectData,
  ): Promise<SocialAccountConnectResult> {
    const payload = this.toUpsertPayload(data);

    const existing = await this.socialAccountRepo.findByWorkspacePlatformAccountId(
      workspaceId,
      payload.platform,
      payload.platformAccountId,
    );

    const encryptedToken = this.encryptionService.encrypt(payload.accessToken);

    if (existing) {
      await Promise.all([
        this.socialCredentialsRepo.updateBySocialAccountId(existing.id, {
          accessToken: encryptedToken,
          expiresAt: payload.expiresAt ?? null,
        }),
        this.socialAccountRepo.update(existing.id, this.buildAccountUpdateData(payload)),
      ]);

      return {
        id: existing.id,
        platform: existing.platform,
        platformAccountId: existing.platformAccountId,
        accountName: existing.accountName,
        username: existing.username ?? undefined,
        profilePicture: existing.profilePicture ?? undefined,
        webhookSubscribed: payload.webhookSubscribed,
        created: false,
      };
    }

    const account = await this.socialAccountRepo.create({
      workspace: { connect: { id: workspaceId } },
      platform: payload.platform,
      platformAccountId: payload.platformAccountId,
      metaPageId: payload.metaPageId,
      accountName: payload.accountName,
      username: payload.username,
      profilePicture: payload.profilePicture,
      metadata: payload.metadata as unknown as Prisma.InputJsonValue,
      status: SocialAccountStatus.ACTIVE,
      webhookSubscribed: payload.webhookSubscribed,
      webhookSubscribedAt: payload.webhookSubscribedAt ?? null,
      webhookFields: payload.webhookFields,
    });

    await this.socialCredentialsRepo.create({
      socialAccount: { connect: { id: account.id } },
      accessToken: encryptedToken,
      expiresAt: payload.expiresAt ?? null,
    });

    return {
      id: account.id,
      platform: account.platform,
      platformAccountId: account.platformAccountId,
      accountName: account.accountName,
      username: account.username ?? undefined,
      profilePicture: account.profilePicture ?? undefined,
      webhookSubscribed: payload.webhookSubscribed,
      created: true,
    };
  }

  private toUpsertPayload(data: MetaPageConnectData): SocialAccountUpsertPayload {
    return {
      platform: data.platform,
      platformAccountId: data.platformAccountId,
      metaPageId: data.metaPageId,
      accountName: data.accountName,
      username: data.username,
      profilePicture: data.profilePicture,
      accessToken: data.accessToken,
      expiresAt: null,
      webhookSubscribed: data.webhookSubscribed,
      webhookSubscribedAt: data.webhookSubscribedAt,
      webhookFields: data.webhookFields,
      metadata: { page: data.pageInfo },
    };
  }

  private buildAccountUpdateData(
    payload: SocialAccountUpsertPayload,
  ): Prisma.SocialAccountUpdateInput {
    return {
      accountName: payload.accountName,
      username: payload.username,
      profilePicture: payload.profilePicture,
      metadata: payload.metadata as unknown as Prisma.InputJsonValue,
      status: SocialAccountStatus.ACTIVE,
      webhookSubscribed: payload.webhookSubscribed,
      webhookSubscribedAt: payload.webhookSubscribedAt ?? null,
      webhookFields: payload.webhookFields,
    };
  }

  /**
   * Finds an ACTIVE social account by its Meta platform account ID (page/IG ID).
   * Used by webhook handlers where only the Meta platform ID is available.
   * Returns null for non-existent or non-ACTIVE accounts so webhook events
   * are silently dropped for disconnected/revoked accounts.
   */
  async findActiveByPlatformAccountId(platformAccountId: string) {
    const account = await this.socialAccountRepo.findByPlatformAccountId(platformAccountId);

    if (!account || account.status !== SocialAccountStatus.ACTIVE) return null;

    return account;
  }
}
