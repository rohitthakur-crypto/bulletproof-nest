import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UserAuthResponse, userResponseSchema } from '../dto';
import { UserCredentialRepository } from '../repositories/user-credential.repository';
import type { LoginInput } from '../validators/login.schema';
import { RegisterInput } from '../validators/register.schema';

import { UserTokenService } from './user-token.service';

import { UsersService } from '@/modules/users';

@Injectable()
export class UserAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly userCredentialRepository: UserCredentialRepository,
    private readonly userTokenService: UserTokenService,
  ) {}

  public register(payload: RegisterInput): Promise<UserAuthResponse> {
    console.log('register', payload);

    return Promise.resolve({
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatar: 'https://example.com/avatar.png',
        lastActiveAt: new Date().toISOString(),
      },
      tokens: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
    });
  }

  async login(loginInput: LoginInput): Promise<UserAuthResponse> {
    const user = await this.usersService.findByEmail(loginInput.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const credential = await this.userCredentialRepository.findByUserId(user.id);

    if (!credential) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginInput.password, credential.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // return this.jwtTokenService.issueAuthTokens(user.id, user.email);
    return {
      user: userResponseSchema.parse(user),
      tokens: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
    };
  }
}
