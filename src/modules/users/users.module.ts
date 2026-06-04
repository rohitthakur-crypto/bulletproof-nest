import { forwardRef, Module } from '@nestjs/common';

import { UsersController } from './controllers/users.controller';
import { UsersRepository } from './repositories/users.repository';
import { UsersCacheService } from './services/users-cache.service';
import { UsersService } from './services/users.service';

import { UserAuthModule } from '@/modules/user-auth';

@Module({
  imports: [forwardRef(() => UserAuthModule)],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UsersCacheService],
  exports: [UsersService],
})
export class UsersModule {}
