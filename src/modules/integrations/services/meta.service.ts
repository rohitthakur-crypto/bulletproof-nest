import { randomUUID } from 'crypto';

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AxiosError } from 'axios';

import { MetaOAuthCacheService } from '../cache';
import {
  META_GRAPH_ME_ACCOUNTS_PATH,
  META_GRAPH_OAUTH_ACCESS_TOKEN_PATH,
  META_GRAPH_OAUTH_PATH,
  META_GRAPH_PAGE_SUBSCRIBED_APPS_PATH,
} from '../constants';
import type { ConnectableAssetResponse } from '../dto';
import type {
  MetaAccessTokenResponse,
  MetaAsset,
  MetaAssetsResponse,
  MetaOAuthSession,
  MetaSubscribeAppsResponse,
  MetaSubscribedAppsResponse,
} from '../interfaces';
import { toConnectableAssets } from '../mappers';
import type { MetaOAuthCallbackQuery } from '../validators';

import { AuthActorType, HttpMethod } from '@/common/enums';
import { AppConfigService } from '@/core/config';
import { JwtSignerService, JwtVerifierService, TokenType } from '@/core/jwt';
import type { MetaOauthTokenPayload } from '@/core/jwt';
import { AppLoggerService } from '@/core/logger';
import { EncryptionService } from '@/core/security/encryption';
import { HttpClientService } from '@/infra/http';
import type { AuthenticatedUser } from '@/modules/user-auth/interfaces';

@Injectable()
export class MetaService {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly config: AppConfigService,
    private readonly http: HttpClientService,
    private readonly jwtSignerService: JwtSignerService,
    private readonly jwtVerifierService: JwtVerifierService,
    private readonly oAuthCache: MetaOAuthCacheService,
    private readonly encryptionService: EncryptionService,
  ) {}

  // ─── OAuth Flow ─────────────────────────────────────────────────────────────

  public async generateAuthUrl(user: AuthenticatedUser, workspaceId: string): Promise<string> {
    const { appId, oauth } = this.config.meta;

    const state = await this.generateState(user, workspaceId);

    const uniqueScopes = [...new Set([...oauth.scopes.facebook, ...oauth.scopes.instagram])];

    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: oauth.redirectUri,
      response_type: 'code',
      state,
      scope: uniqueScopes.join(','),
      auth_type: 'rerequest',
    });

    return `${this.getFacebookBaseUrl()}/${META_GRAPH_OAUTH_PATH}?${params.toString()}`;
  }

  public async handleOAuthCallback(query: MetaOAuthCallbackQuery): Promise<string> {
    const frontendBase = this.config.meta.oauth.successRedirectUri!;

    if (query.error) {
      return this.buildFrontendRedirect(frontendBase, {
        status: 'error',
        reason: query.error,
      });
    }

    let payload: MetaOauthTokenPayload;

    try {
      payload = await this.verifyState(query.state);
    } catch {
      return this.buildFrontendRedirect(frontendBase, {
        status: 'error',
        reason: 'invalid_state',
      });
    }

    try {
      const token = await this.exchangeCodeForToken(query.code!);

      await this.saveOAuthSession(
        payload.sub,
        payload.sessionId,
        payload.workspaceId,
        token.access_token,
      );

      return this.buildFrontendRedirect(frontendBase, {
        status: 'success',
        provider: 'meta',
      });
    } catch (error) {
      this.logger.error('Meta OAuth callback failed after token exchange', { error });

      return this.buildFrontendRedirect(frontendBase, {
        status: 'error',
        reason: 'token_exchange_failed',
      });
    }
  }

  // ─── Assets ──────────────────────────────────────────────────────────────────

  public async listConnectableAssets(
    user: AuthenticatedUser,
    workspaceId: string,
  ): Promise<ConnectableAssetResponse[]> {
    const assets = await this.resolveAssetsForConnect(user, workspaceId);

    return toConnectableAssets({ data: assets });
  }

  public async resolveAssetsForConnect(
    user: AuthenticatedUser,
    workspaceId: string,
  ): Promise<MetaAsset[]> {
    const session = await this.requireOAuthSession(user.sessionId, workspaceId);
    const response = await this.fetchUserPages(session.accessToken);

    return response.data;
  }

  // ─── Webhook Subscription ────────────────────────────────────────────────────

  /**
   * Subscribes a page to the configured webhook fields and verifies the
   * subscription was accepted by Meta before returning the subscribed fields.
   */
  public async subscribeAndVerifyPageWebhooks(
    pageId: string,
    pageAccessToken: string,
  ): Promise<string[]> {
    const subscribedFields = this.getWebhookSubscribedFields();

    await this.subscribePageToWebhooks(pageId, pageAccessToken, subscribedFields);

    const verified = await this.verifyPageWebhookSubscription(
      pageId,
      pageAccessToken,
      subscribedFields,
    );

    if (!verified) {
      throw new BadRequestException(
        `Page ${pageId} webhook subscription could not be verified — check app permissions`,
      );
    }

    return subscribedFields;
  }

  // ─── Session Management ──────────────────────────────────────────────────────

  public async clearOAuthSession(sessionId: string, workspaceId: string): Promise<void> {
    await this.oAuthCache.deleteOAuthSession(sessionId, workspaceId);
  }

  // ─── Private: URL helpers ────────────────────────────────────────────────────

  private getGraphBaseUrl(): string {
    const { graph } = this.config.meta;
    return `${graph.baseUrl}/${graph.version}`;
  }

  private getFacebookBaseUrl(): string {
    const { facebook } = this.config.meta;
    return `${facebook.baseUrl}/${facebook.version}`;
  }

  private getWebhookSubscribedFields(): string[] {
    const fields = this.config.meta.webhook.subscribedFields;

    if (fields.length === 0) {
      throw new InternalServerErrorException('META_WEBHOOK_SUBSCRIBED_FIELDS is not configured');
    }

    return fields;
  }

  // ─── Private: OAuth helpers ──────────────────────────────────────────────────

  private async generateState(user: AuthenticatedUser, workspaceId: string): Promise<string> {
    const payload: MetaOauthTokenPayload = {
      sub: user.userId,
      sessionId: user.sessionId,
      jti: randomUUID(),
      actorType: AuthActorType.USER,
      type: TokenType.META_OAUTH,
      workspaceId,
    };

    return this.jwtSignerService.sign(payload, AuthActorType.USER, TokenType.META_OAUTH);
  }

  private async verifyState(state: string): Promise<MetaOauthTokenPayload> {
    try {
      return await this.jwtVerifierService.verify<MetaOauthTokenPayload>(
        state,
        AuthActorType.USER,
        TokenType.META_OAUTH,
      );
    } catch (error) {
      throw new BadRequestException('Invalid OAuth state', { cause: error });
    }
  }

  private async exchangeCodeForToken(code: string): Promise<MetaAccessTokenResponse> {
    const { appId, appSecret, oauth } = this.config.meta;

    return this.http.request<MetaAccessTokenResponse>({
      method: HttpMethod.GET,
      url: META_GRAPH_OAUTH_ACCESS_TOKEN_PATH,
      baseURL: this.getGraphBaseUrl(),
      params: {
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: oauth.redirectUri,
        code,
      },
    });
  }

  private buildFrontendRedirect(base: string, params: Record<string, string>): string {
    const url = new URL(base);

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    return url.toString();
  }

  // ─── Private: Session helpers ─────────────────────────────────────────────────

  private async saveOAuthSession(
    userId: string,
    sessionId: string,
    workspaceId: string,
    accessToken: string,
  ): Promise<void> {
    const payload: MetaOAuthSession = {
      userId,
      workspaceId,
      accessToken: this.encryptionService.encrypt(accessToken),
    };

    await this.oAuthCache.setOAuthSession(sessionId, workspaceId, payload);
  }

  private async requireOAuthSession(
    sessionId: string,
    workspaceId: string,
  ): Promise<MetaOAuthSession> {
    const session = await this.oAuthCache.getOAuthSession(sessionId, workspaceId);

    if (!session) {
      throw new NotFoundException('Meta OAuth session not found or expired — please reconnect');
    }

    if (session.workspaceId !== workspaceId) {
      throw new BadRequestException('Meta OAuth session workspace mismatch');
    }

    return {
      userId: session.userId,
      workspaceId: session.workspaceId,
      accessToken: this.encryptionService.decrypt(session.accessToken),
    };
  }

  // ─── Private: Graph API ──────────────────────────────────────────────────────

  private async fetchUserPages(accessToken: string): Promise<MetaAssetsResponse> {
    return this.http.request<MetaAssetsResponse>({
      method: HttpMethod.GET,
      baseURL: this.getGraphBaseUrl(),
      url: META_GRAPH_ME_ACCOUNTS_PATH,
      params: {
        fields:
          'id,name,picture.type(large),access_token,instagram_business_account{id,username,name,profile_picture_url}',
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  private async subscribePageToWebhooks(
    pageId: string,
    pageAccessToken: string,
    subscribedFields: string[],
  ): Promise<void> {
    try {
      const response = await this.http.request<MetaSubscribeAppsResponse>({
        method: HttpMethod.POST,
        baseURL: this.getGraphBaseUrl(),
        url: META_GRAPH_PAGE_SUBSCRIBED_APPS_PATH(pageId),
        params: {
          subscribed_fields: subscribedFields.join(','),
          access_token: pageAccessToken,
        },
      });

      if (!response.success) {
        throw new BadRequestException(`Meta rejected webhook subscription for page ${pageId}`);
      }
    } catch (error) {
      throw this.toWebhookError(error, pageId, 'subscribe');
    }
  }

  private async verifyPageWebhookSubscription(
    pageId: string,
    pageAccessToken: string,
    requiredFields: string[],
  ): Promise<boolean> {
    let response: MetaSubscribedAppsResponse;

    try {
      response = await this.http.request<MetaSubscribedAppsResponse>({
        method: HttpMethod.GET,
        baseURL: this.getGraphBaseUrl(),
        url: META_GRAPH_PAGE_SUBSCRIBED_APPS_PATH(pageId),
        headers: { Authorization: `Bearer ${pageAccessToken}` },
      });
    } catch (error) {
      throw this.toWebhookError(error, pageId, 'verify');
    }

    const appSubscription = response.data.find((app) => app.id === this.config.meta.appId);

    if (!appSubscription) {
      this.logger.warn(`Meta app not found in page ${pageId} subscriptions`);
      return false;
    }

    const subscribedSet = new Set(appSubscription.subscribed_fields ?? []);
    const allPresent = requiredFields.every((field) => subscribedSet.has(field));

    if (!allPresent) {
      this.logger.warn(`Page ${pageId} is missing required webhook fields`, {
        required: requiredFields,
        subscribed: [...subscribedSet],
      });
    }

    return allPresent;
  }

  // ─── Private: Error helpers ───────────────────────────────────────────────────

  private toWebhookError(
    error: unknown,
    pageId: string,
    action: 'subscribe' | 'verify',
  ): BadRequestException {
    if (error instanceof BadRequestException) {
      return error;
    }

    if (error instanceof AxiosError) {
      const metaMessage = this.extractMetaErrorMessage(error);

      return new BadRequestException(
        metaMessage ??
          `Failed to ${action} Meta webhooks for page ${pageId}. Check page permissions.`,
      );
    }

    return new BadRequestException(`Failed to ${action} Meta webhooks for page ${pageId}`);
  }

  private extractMetaErrorMessage(error: AxiosError): string | undefined {
    const data = error.response?.data;

    if (!data || typeof data !== 'object') {
      return undefined;
    }

    const payload = data as { error?: { message?: string } };

    return payload.error?.message;
  }
}
