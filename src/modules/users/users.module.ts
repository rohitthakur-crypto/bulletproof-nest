import { forwardRef, Module } from '@nestjs/common';

import { UsersCacheService } from './cache/users-cache.service';
import { UserProfileController } from './controllers/user-profile.controller';
import { UsersRepository } from './repositories/users.repository';
import { UserProfileService } from './services/user-profile.service';
import { UsersService } from './services/users.service';

import { UserAuthModule } from '@/modules/user-auth';

@Module({
  imports: [forwardRef(() => UserAuthModule)],
  controllers: [UserProfileController],
  providers: [UserProfileService, UsersService, UsersRepository, UsersCacheService],
  exports: [UsersService],
})
export class UsersModule {}
