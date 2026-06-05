import { Injectable } from '@nestjs/common';

import type { UserResponse } from '../dto';
import { toUserResponse } from '../mappers/user-response.mapper';

import { UsersService } from './users.service';

@Injectable()
export class UserProfileService {
  constructor(private readonly usersService: UsersService) {}

  async getProfile(userId: string): Promise<UserResponse> {
    const user = await this.usersService.findById(userId);
    return toUserResponse(user);
  }
}
