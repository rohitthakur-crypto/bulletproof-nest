import { Injectable, NotFoundException } from '@nestjs/common';
import { SocialAccountStatus, type Prisma } from '@prisma/client';

import type { PaginatedSocialAccountsResponse, SocialAccountResponse } from '../dto';
import type { SocialAccountConnectResult, SocialAccountUpsertPayload } from '../interfaces';
import { toSocialAccountResponse } from '../mappers/social-account.mapper';
import { SocialAccountsRepository, SocialCredentialsRepository } from '../repositories';
import { buildMetaSocialAccountPayloads, findMetaPageById } from '../utils';
import type {
  CreateSocialAccountsType,
  GetSocialAccountsQuery,
  ListSocialAccountsFilters,
} from '../validators';

import { MetaService } from './meta.service';

import { EncryptionService } from '@/core/security/encryption';
import { buildOffsetPaginationMeta, toPrismaOffset } from '@/infra/prisma';
import type { AuthenticatedUser } from '@/modules/user-auth/interfaces';

@Injectable()
export class SocialAccountsService {
  constructor(
    private readonly metaService: MetaService,
    private readonly socialAccountRepo: SocialAccountsRepository,
    private readonly socialCredentialsRepo: SocialCredentialsRepository,
    private readonly encryptionService: EncryptionService,
  ) {}

  public async listSocialAccounts(
    workspaceId: string,
    query: GetSocialAccountsQuery,
  ): Promise<PaginatedSocialAccountsResponse> {
    const filters: ListSocialAccountsFilters = {
      workspaceId,
      ...query,
    };

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

  public async createSocialAccount(
    user: AuthenticatedUser,
    workspaceId: string,
    selections: CreateSocialAccountsType,
  ): Promise<SocialAccountConnectResult[]> {
    const metaPages = await this.metaService.resolveMetaAssetsForConnect(user, workspaceId);
    const results: SocialAccountConnectResult[] = [];

    for (const selection of selections) {
      const page = findMetaPageById(metaPages, selection.pageId);
      const payloads = buildMetaSocialAccountPayloads(page, selection);

      for (const payload of payloads) {
        results.push(await this.upsertSocialAccount(workspaceId, payload));
      }
    }

    return results;
  }

  private async upsertSocialAccount(
    workspaceId: string,
    payload: SocialAccountUpsertPayload,
  ): Promise<SocialAccountConnectResult> {
    const existing = await this.socialAccountRepo.findByWorkspacePlatformAccountId(
      workspaceId,
      payload.platform,
      payload.platformAccountId,
    );

    const encryptedAccessToken = this.encryptionService.encrypt(payload.accessToken);

    if (existing) {
      await this.socialCredentialsRepo.updateBySocialAccountId(existing.id, {
        accessToken: encryptedAccessToken,
        expiresAt: payload.expiresAt ?? null,
      });

      await this.socialAccountRepo.update(existing.id, {
        metadata: payload.metadata as unknown as Prisma.InputJsonValue,
      });

      return {
        id: existing.id,
        platform: existing.platform,
        platformAccountId: existing.platformAccountId,
        accountName: existing.accountName,
        username: existing.username ?? undefined,
        profilePicture: existing.profilePicture ?? undefined,
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
    });

    await this.socialCredentialsRepo.create({
      socialAccount: { connect: { id: account.id } },
      accessToken: encryptedAccessToken,
      expiresAt: payload.expiresAt ?? null,
    });

    return {
      id: account.id,
      platform: account.platform,
      platformAccountId: account.platformAccountId,
      accountName: account.accountName,
      username: account.username ?? undefined,
      profilePicture: account.profilePicture ?? undefined,
      created: true,
    };
  }
}
