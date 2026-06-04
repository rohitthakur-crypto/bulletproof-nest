import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';

import type { CreateUserInput } from '../dto/create-user.dto';
import type { UpdateUserInput } from '../dto/update-user.dto';

import { BasePrismaRepository, PrismaService } from '@/infra/prisma';

@Injectable()
export class UsersRepository extends BasePrismaRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.db.user.count({ where: { email } });
    return count > 0;
  }

  async create(data: CreateUserInput): Promise<User> {
    return this.db.user.create({ data });
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    return this.db.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<User | null> {
    return this.db.user.delete({ where: { id } });
  }
}
