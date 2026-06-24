import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SocialPlatform } from '@prisma/client';

import { MetaMessageType } from '../enums';
import { MetaDmRequest, MetaDmResponse, MetaDmCommentReplyRequest } from '../interfaces';

import { HttpMethod } from '@/common/enums';
import { AppConfigService } from '@/core/config/services/app-config.service';
import { EncryptionService } from '@/core/security/encryption/encryption.service';
import { HttpClientService } from '@/infra/http/http-client.service';
import {
  META_GRAPH_INSTAGRAM_MESSAGES_PATH,
  META_GRAPH_PAGE_MESSAGES_PATH,
} from '@/modules/integrations/constants';
import { SocialAccountsRepository } from '@/modules/social-accounts/repositories/social-accounts.repository';
import { SocialCredentialsRepository } from '@/modules/social-accounts/repositories/social-credentials.repository';

@Injectable()
export class MetaDmService {
  private readonly logger = new Logger(MetaDmService.name);

  constructor(
    private readonly http: HttpClientService,
    private readonly config: AppConfigService,
    private readonly socialAccountRepo: SocialAccountsRepository,
    private readonly credentialsRepo: SocialCredentialsRepository,
    private readonly encryption: EncryptionService,
  ) {}

  /**
   * Sends a direct message to a user via Meta Graph API.
   * Resolves page credentials and platform internally.
   */
  public async sendDirectMessage(
    socialAccountId: string,
    recipientId: string,
    message: string,
  ): Promise<MetaDmResponse> {
    const account = await this.socialAccountRepo.findById(socialAccountId);

    if (!account) {
      throw new NotFoundException(`Social account ${socialAccountId} not found`);
    }

    const credentials = await this.credentialsRepo.findBySocialAccountId(socialAccountId);

    if (!credentials) {
      throw new NotFoundException(`Credentials for social account ${socialAccountId} not found`);
    }

    const accessToken = this.encryption.decrypt(credentials.accessToken);

    const endpoint = this.resolveMessagesEndpoint(account.platform, account.metaPageId ?? '');

    const body: MetaDmRequest = {
      recipient: { id: recipientId },
      message: { text: message },
      messaging_type: MetaMessageType.RESPONSE,
    };

    this.logger.debug(
      `Sending DM via ${account.platform} to recipient ${recipientId} from account ${account.platformAccountId}`,
    );

    const response = await this.http.request<MetaDmResponse, MetaDmRequest>({
      method: HttpMethod.POST,
      url: endpoint,
      baseURL: this.getGraphBaseUrl(),
      data: body,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    this.logger.debug(`DM sent. message_id=${response.message_id}`);

    return response;
  }

  public async sendCommentReply(
    socialAccountId: string,
    commentId: string,
    message: string,
  ): Promise<MetaDmResponse> {
    const account = await this.socialAccountRepo.findById(socialAccountId);

    if (!account) {
      throw new NotFoundException(`Social account ${socialAccountId} not found`);
    }

    const credentials = await this.credentialsRepo.findBySocialAccountId(socialAccountId);

    if (!credentials) {
      throw new NotFoundException(`Credentials for social account ${socialAccountId} not found`);
    }

    const accessToken = this.encryption.decrypt(credentials.accessToken);

    const body: MetaDmCommentReplyRequest = {
      recipient: { comment_id: commentId },
      message: { text: message },
    };

    this.logger.debug(
      `Sending private reply via ${account.platform} to comment ${commentId} from account ${account.platformAccountId}`,
    );

    const endpoint = this.resolveMessagesEndpoint(account.platform, account.metaPageId ?? '');

    const response = await this.http.request<MetaDmResponse, MetaDmCommentReplyRequest>({
      method: HttpMethod.POST,
      url: endpoint,
      baseURL: this.getGraphBaseUrl(),
      data: body,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    this.logger.debug(`Comment reply sent. message_id=${response.message_id}`);

    return response;
  }

  // ─── Private ──────────────────────────────────────────────────────────────────

  private getGraphBaseUrl(): string {
    const { graph } = this.config.meta;
    return `${graph.baseUrl}/${graph.version}`;
  }

  private resolveMessagesEndpoint(platform: SocialPlatform, platformAccountId: string): string {
    if (platform === SocialPlatform.INSTAGRAM) {
      return META_GRAPH_INSTAGRAM_MESSAGES_PATH(platformAccountId);
    }

    return META_GRAPH_PAGE_MESSAGES_PATH(platformAccountId);
  }
}
