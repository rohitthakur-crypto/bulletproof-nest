import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

import { PASSWORD_HASH_OPTIONS } from './constants/password.constants';

@Injectable()
export class PasswordService {
  public async hash(password: string): Promise<string> {
    return argon2.hash(password, PASSWORD_HASH_OPTIONS);
  }

  public async verify(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  public needsRehash(hash: string): boolean {
    return argon2.needsRehash(hash, PASSWORD_HASH_OPTIONS);
  }
}
