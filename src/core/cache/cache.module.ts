import { Global, Module } from '@nestjs/common';

import { CacheService } from './cache.service';

import { RedisModule } from '@/infra/redis';

@Global()
@Module({
  imports: [RedisModule],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
