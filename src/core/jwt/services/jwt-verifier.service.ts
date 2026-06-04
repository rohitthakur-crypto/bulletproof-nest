import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JWT_TOKEN_CONFIG } from '../constants/jwt-algorithm.constant';
import { TokenType } from '../enums/token.enum';
import type { BaseTokenPayload } from '../interfaces/jwt-payload.interface';

import { JwtKeyService } from './jwt-key.service';

import { AuthActorType } from '@/common/enums';

@Injectable()
export class JwtVerifierService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly jwtKeyService: JwtKeyService,
  ) {}

  async verify<T extends BaseTokenPayload>(
    token: string,
    actor: AuthActorType,
    tokenType: TokenType,
  ): Promise<T> {
    const keys = this.jwtKeyService.getKeys(actor, tokenType);

    try {
      const payload = await this.jwtService.verifyAsync<T>(token, {
        algorithms: JWT_TOKEN_CONFIG.algorithms,
        publicKey: keys.publicKey,
      });

      if (payload.actorType !== actor) {
        throw new UnauthorizedException('Invalid actor type');
      }

      if (payload.type !== tokenType) {
        throw new UnauthorizedException('Invalid token type');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  decode<T extends BaseTokenPayload>(token: string): T | null {
    const payload = this.jwtService.decode<T | string>(token);

    if (!payload || typeof payload === 'string') {
      return null;
    }

    return payload;
  }
}
