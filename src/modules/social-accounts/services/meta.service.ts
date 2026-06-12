import { randomUUID } from 'crypto';

import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { SocialAccountCacheService } from '../cache';
import {
  META_GRAPH_ME_ACCOUNTS_PATH,
  META_GRAPH_OAUTH_ACCESS_TOKEN_PATH,
  META_GRAPH_OAUTH_PATH,
} from '../constants';
import { MetaPageResponse } from '../dto';
import type {
  MetaAccessTokenResponse,
  MetaOAuthSession,
  MetaGraphPagesResponse,
} from '../interfaces';
import { mapMetaGraphPageToMetaPage } from '../mappers/meta-grpah-page.mapper';
import { MetaOAuthCallbackQuery } from '../validators';

import { AuthActorType, HttpMethod } from '@/common/enums';
import { AppConfigService } from '@/config';
import { JwtSignerService, JwtVerifierService, TokenType } from '@/core/jwt';
import type { MetaOauthTokenPayload } from '@/core/jwt';
import { EncryptionService } from '@/core/security/encryption';
import { HttpClientService } from '@/infra/http';
import type { AuthenticatedUser } from '@/modules/user-auth/interfaces';

@Injectable()
export class MetaService {
  private readonly logger = new Logger(MetaService.name);

  constructor(
    private readonly config: AppConfigService,
    private readonly http: HttpClientService,
    private readonly jwtSignerService: JwtSignerService,
    private readonly jwtVerifierService: JwtVerifierService,
    private readonly socialAccountCacheService: SocialAccountCacheService,
    private readonly encryptionService: EncryptionService,
  ) {}

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
    });

    return `${this.getFacebookBaseUrl()}/${META_GRAPH_OAUTH_PATH}?${params.toString()}`;
  }

  public async handleMetaOAuthCallback(query: MetaOAuthCallbackQuery): Promise<string> {
    const frontendBase = this.config.meta.oauth.successRedirectUri!;

    if (query.error) {
      return this.buildFrontendRedirect(frontendBase, { status: 'error', reason: query.error });
    }

    let payload: MetaOauthTokenPayload;
    try {
      payload = await this.verifyState(query.state);
    } catch {
      return this.buildFrontendRedirect(frontendBase, { status: 'error', reason: 'invalid_state' });
    }

    try {
      const token = await this.getMetaOAuthToken(query.code!);

      await this.saveMetaOAuthSession(
        payload.sub,
        payload.sessionId,
        payload.workspaceId,
        token.access_token,
      );

      return this.buildFrontendRedirect(frontendBase, { status: 'success', provider: 'meta' });
    } catch (error) {
      this.logger.error('Meta OAuth callback failed after token exchange', error);
      return this.buildFrontendRedirect(frontendBase, {
        status: 'error',
        reason: 'token_exchange_failed',
      });
    }
  }

  public async getMetaPages(
    user: AuthenticatedUser,
    workspaceId: string,
  ): Promise<Array<MetaPageResponse>> {
    const metaOAuthSession = await this.getMetaOAuthSession(user.sessionId);

    if (!metaOAuthSession) {
      throw new NotFoundException('Meta OAuth session not found');
    }

    if (metaOAuthSession.workspaceId !== workspaceId) {
      throw new BadRequestException(
        'Meta OAuth session workspace does not match the requested workspace',
      );
    }

    const pages = await this.getPages(metaOAuthSession.accessToken);

    return pages.data.map(mapMetaGraphPageToMetaPage);
  }

  private getGraphBaseUrl(): string {
    const { graph } = this.config.meta;
    return `${graph.baseUrl}/${graph.version}`;
  }

  private getFacebookBaseUrl(): string {
    const { facebook } = this.config.meta;
    return `${facebook.baseUrl}/${facebook.version}`;
  }

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
      throw new BadRequestException('Invalid state', {
        cause: error,
      });
    }
  }

  private async getMetaOAuthToken(code: string): Promise<MetaAccessTokenResponse> {
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

  private async saveMetaOAuthSession(
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

    await this.socialAccountCacheService.setMetaOAuthSession(sessionId, payload);
  }

  public async getMetaOAuthSession(sessionId: string): Promise<MetaOAuthSession> {
    const session = await this.socialAccountCacheService.getMetaOAuthSession(sessionId);
    if (!session) {
      throw new NotFoundException('Meta OAuth session not found');
    }
    return {
      userId: session.userId,
      workspaceId: session.workspaceId,
      accessToken: this.encryptionService.decrypt(session.accessToken),
    };
  }

  private async getPages(accessToken: string): Promise<MetaGraphPagesResponse> {
    const response = await this.http.request<MetaGraphPagesResponse>({
      method: HttpMethod.GET,
      baseURL: this.getGraphBaseUrl(),
      url: META_GRAPH_ME_ACCOUNTS_PATH,
      params: {
        fields: 'id,name,picture.type(large),cover,access_token',
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response;
  }
}
