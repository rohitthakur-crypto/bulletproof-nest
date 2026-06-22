import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '@prisma/client';

import { UsersCacheService } from '../cache/users-cache.service';
import type { CreateUserInput, UpdateUserInput } from '../dto';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersCache: UsersCacheService,
  ) {}

  findById(id: string): Promise<User> {
    return this.usersCache.rememberById(id, async () => {
      const user = await this.usersRepository.findById(id);

      if (!user) throw new NotFoundException('User not found');

      return user;
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersCache.getOrSetByEmail(email, () => this.usersRepository.findByEmail(email));
  }

  async create(data: CreateUserInput): Promise<User> {
    const existing = await this.findByEmail(data.email);

    if (existing) throw new ConflictException('Email already in use');

    return this.usersRepository.create(data);
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    const existing = await this.findById(id);

    if (!existing) throw new NotFoundException('User not found');

    const updated = await this.usersRepository.update(id, data);

    await this.usersCache.invalidateUser(id, updated.email);

    return updated;
  }

  async deleteUser(id: string): Promise<User | null> {
    const user = await this.usersRepository.delete(id);

    if (!user) throw new NotFoundException('User not found');

    await this.usersCache.invalidateUser(id, user.email);

    return user;
  }
}
