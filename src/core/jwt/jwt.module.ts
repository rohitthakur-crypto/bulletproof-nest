import { Global, Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';

import { JwtKeyService } from './services/jwt-key.service';
import { JwtSignerService } from './services/jwt-signer.service';
import { JwtVerifierService } from './services/jwt-verifier.service';

import { AppConfigModule } from '@/core/config';

@Global()
@Module({
  imports: [AppConfigModule, NestJwtModule.register({})],
  providers: [JwtKeyService, JwtSignerService, JwtVerifierService],
  exports: [JwtKeyService, JwtSignerService, JwtVerifierService],
})
export class JwtModule {}
