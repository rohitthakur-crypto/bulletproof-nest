import { Injectable, UnauthorizedException } from '@nestjs/common';

import { UserCredentialRepository } from '../repositories/user-credential.repository';

import { PasswordService } from '@/core/security/password/password.service';

@Injectable()
export class UserCredentialService {
  constructor(
    private readonly credentialRepository: UserCredentialRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async create(userId: string, password: string): Promise<void> {
    const passwordHash = await this.passwordService.hash(password);
    await this.credentialRepository.create(userId, passwordHash);
  }

  async verifyPassword(userId: string, password: string): Promise<void> {
    const credential = await this.credentialRepository.findByUserId(userId);

    if (!credential) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.passwordService.verify(credential.passwordHash, password);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.upgradeHashIfNeeded(userId, password, credential.passwordHash);
  }

  private async upgradeHashIfNeeded(
    userId: string,
    password: string,
    currentHash: string,
  ): Promise<void> {
    const shouldRehash = this.passwordService.needsRehash(currentHash);

    if (!shouldRehash) {
      return;
    }

    const passwordHash = await this.passwordService.hash(password);
    await this.credentialRepository.updatePassword(userId, passwordHash);
  }
}
