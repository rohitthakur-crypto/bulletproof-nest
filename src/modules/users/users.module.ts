import { forwardRef, Module } from '@nestjs/common';

import { UserProfileController } from './controllers/user-profile.controller';
import { UsersRepository } from './repositories/users.repository';
import { UserProfileService } from './services/user-profile.service';
import { UsersCacheService } from './services/users-cache.service';
import { UsersService } from './services/users.service';

import { UserAuthModule } from '@/modules/user-auth';
import { UserAccessTokenGuard } from '@/modules/user-auth/guards/user-access-token.guard';

@Module({
  imports: [forwardRef(() => UserAuthModule)],
  controllers: [UserProfileController],
  providers: [
    UserProfileService,
    UsersService,
    UsersRepository,
    UsersCacheService,
    UserAccessTokenGuard,
  ],
  exports: [UsersService],
})
export class UsersModule {}
