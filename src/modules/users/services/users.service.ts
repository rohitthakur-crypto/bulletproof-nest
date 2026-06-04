import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '@prisma/client';

import type { CreateUserInput } from '../dto/create-user.dto';
import type { UpdateUserInput } from '../dto/update-user.dto';
import { UsersRepository } from '../repositories/users.repository';

import { UsersCacheService } from './users-cache.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersCache: UsersCacheService,
  ) {}

  async findById(id: string): Promise<User> {
    const cached = await this.usersCache.getById(id);
    if (cached) return cached;

    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');

    await this.usersCache.setById(id, user);

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const cached = await this.usersCache.getByEmail(email);
    if (cached) return cached;

    const user = await this.usersRepository.findByEmail(email);
    if (!user) return null;

    await this.usersCache.setByEmail(email, user);

    return user;
  }

  async findByEmailOrThrow(email: string): Promise<User> {
    const user = await this.findByEmail(email);

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async createUser(data: CreateUserInput): Promise<User> {
    const existing = await this.usersRepository.findByEmail(data.email);
    if (existing) throw new ConflictException('User already exists');

    return this.usersRepository.create(data);
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    const existing = await this.usersRepository.findById(id);
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
