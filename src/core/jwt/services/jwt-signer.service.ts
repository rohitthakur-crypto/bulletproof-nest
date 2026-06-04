import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';

import { JWT_TOKEN_CONFIG } from '../constants/jwt-algorithm.constant';
import { TokenType } from '../enums/token.enum';
import { JwtCoreSignOptions } from '../interfaces/jwt-sign-options.interface';

import { JwtKeyService } from './jwt-key.service';

import { AuthActorType } from '@/common/enums';
import { toSeconds } from '@/common/utils';

@Injectable()
export class JwtSignerService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly jwtKeyService: JwtKeyService,
  ) {}

  async sign(payload: object, actor: AuthActorType, tokenType: TokenType): Promise<string> {
    const keys = this.jwtKeyService.getKeys(actor, tokenType);

    const options: JwtCoreSignOptions = {
      privateKey: keys.privateKey,
      expiresIn: toSeconds(keys.expiresIn as StringValue),
      kid: keys.kid,
      algorithm: JWT_TOKEN_CONFIG.algorithm,
    };

    return this.jwtService.signAsync(payload, options);
  }
}
