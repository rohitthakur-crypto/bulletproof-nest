import { randomUUID } from 'node:crypto';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { User } from '@prisma/client';
import type { StringValue } from 'ms';

import { AuthTokenResponse, UserAuthResponse } from '../dto';
import type { AuthDeviceContext, CreateSessionInput } from '../interfaces';
import type { LoginInput } from '../validators/login.schema';
import { RegisterInput } from '../validators/register.schema';

import { UserCredentialService } from './user-credential.service';
import { UserRefreshTokenService } from './user-refresh-token.service';
import { UserSessionService } from './user-session.service';
import { UserTokenService } from './user-token.service';

import { AuthActorType } from '@/common/enums';
import { hashToken, toDate } from '@/common/utils';
import { AppConfigService } from '@/config';
import { TokenType } from '@/core/jwt';
import { toUserResponse, UsersService } from '@/modules/users';

@Injectable()
export class UserAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly userCredentialService: UserCredentialService,
    private readonly userSessionService: UserSessionService,
    private readonly userTokenService: UserTokenService,
    private readonly userRefreshTokenService: UserRefreshTokenService,
    private readonly config: AppConfigService,
  ) {}

  async register(payload: RegisterInput): Promise<UserAuthResponse> {
    const user = await this.usersService.create({
      name: payload.name,
      email: payload.email,
    });

    await this.userCredentialService.create(user.id, payload.password);

    const tokens = await this.createSessionAndIssueTokens(user.id, this.toDeviceContext(payload));

    return {
      user: toUserResponse(user),
      tokens,
    };
  }

  async login(loginInput: LoginInput): Promise<UserAuthResponse> {
    const user = await this.findUserByEmailOrFail(loginInput.email);

    await this.userCredentialService.verifyPassword(user.id, loginInput.password);

    return this.buildAuthResponse(user, this.toDeviceContext(loginInput));
  }

  private async findUserByEmailOrFail(email: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private async buildAuthResponse(
    user: User,
    device: AuthDeviceContext,
  ): Promise<UserAuthResponse> {
    const tokens = await this.createSessionAndIssueTokens(user.id, device);

    return {
      user: toUserResponse(user),
      tokens,
    };
  }

  private async createSessionAndIssueTokens(
    userId: string,
    device: AuthDeviceContext,
  ): Promise<AuthTokenResponse> {
    const refreshExpiresAt = this.getRefreshTokenExpiresAt();

    const session = await this.userSessionService.upsertForDevice(
      this.buildSessionInput(userId, device, refreshExpiresAt),
    );

    await this.userRefreshTokenService.revokeAllForSession(session.id);

    return this.issueAndPersistTokenPair(userId, session.id, refreshExpiresAt);
  }

  private getRefreshTokenExpiresAt(): Date {
    return toDate(this.config.jwt.user.refresh.expiresIn as StringValue);
  }

  private buildSessionInput(
    userId: string,
    device: AuthDeviceContext,
    expiresAt: Date,
  ): CreateSessionInput {
    return {
      userId,
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      platform: device.platform,
      osVersion: device.osVersion,
      appVersion: device.appVersion,
      userAgent: device.userAgent,
      fcmToken: device.fcmToken,
      ipAddress: device.ipAddress,
      country: device.country,
      region: device.region,
      city: device.city,
      expiresAt,
    };
  }

  private async issueAndPersistTokenPair(
    userId: string,
    sessionId: string,
    refreshExpiresAt: Date,
  ): Promise<AuthTokenResponse> {
    const accessJti = randomUUID();
    const refreshJti = randomUUID();
    const tokenFamily = randomUUID();

    const accessToken = await this.userTokenService.signAccessToken({
      sub: userId,
      sessionId,
      jti: accessJti,
      actorType: AuthActorType.USER,
      type: TokenType.ACCESS,
    });

    const refreshToken = await this.userTokenService.signRefreshToken({
      sub: userId,
      sessionId,
      jti: refreshJti,
      actorType: AuthActorType.USER,
      type: TokenType.REFRESH,
    });

    await this.userRefreshTokenService.save({
      userId,
      sessionId,
      jti: refreshJti,
      tokenFamily,
      expiresAt: refreshExpiresAt,
      tokenHash: hashToken(refreshToken),
    });

    return { accessToken, refreshToken };
  }

  private toDeviceContext(
    input: Pick<RegisterInput | LoginInput, 'deviceId' | 'deviceType' | 'platform' | 'fcmToken'>,
  ): AuthDeviceContext {
    return {
      deviceId: input.deviceId,
      deviceType: input.deviceType,
      platform: input.platform,
      fcmToken: input.fcmToken,
    };
  }
}
