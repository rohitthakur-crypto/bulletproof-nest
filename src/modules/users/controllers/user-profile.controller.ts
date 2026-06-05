import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { UserResponseDto } from '../dto';
import { UserProfileService } from '../services/user-profile.service';

import { ApiVersion } from '@/common/enums';
import { ApiMessage } from '@/core/api';
import { CurrentUser } from '@/modules/user-auth/decorators/current-user.decorator';
import { UserAccessTokenGuard } from '@/modules/user-auth/guards/user-access-token.guard';
import type { AuthenticatedUser } from '@/modules/user-auth/interfaces';

@ApiTags('Users')
@Controller({ path: 'users', version: ApiVersion.V1 })
@UseGuards(UserAccessTokenGuard)
@ApiBearerAuth()
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get('me')
  @ApiMessage('Profile fetched successfully')
  @ApiOkResponse({ description: 'Current user profile', type: UserResponseDto })
  getUserProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.userProfileService.getProfile(user.userId);
  }
}
