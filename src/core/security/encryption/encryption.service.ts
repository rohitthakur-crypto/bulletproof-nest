import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

import { Injectable } from '@nestjs/common';

import { ENCRYPTION_ALGORITHM, IV_LENGTH } from './encryption.constants';

import { AppConfigService } from '@/core/config';

@Injectable()
export class EncryptionService {
  constructor(private readonly config: AppConfigService) {}

  encrypt(value: string): string {
    const key = this.getKey();
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
  }

  decrypt(value: string): string {
    const key = this.getKey();
    const [ivHex, authTagHex, encryptedHex] = value.split(':');

    const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, Buffer.from(ivHex, 'hex'));

    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, 'hex')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  private getKey(): Buffer {
    return Buffer.from(this.config.security.encryptionKey, 'hex');
  }
}
