import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { UserAuthResponseDto, type UserAuthResponse } from '../dto';
import { UserAuthService } from '../services/user-auth.service';
import { LoginDto } from '../validators/login.schema';
import { RegisterDto } from '../validators/register.schema';

import { ApiVersion } from '@/common/enums';
import { ApiMessage } from '@/core/api';

@ApiTags('User Auth')
@Controller({ path: 'auth', version: ApiVersion.V1 })
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Post('register')
  @ApiMessage('Register successful')
  @ApiOkResponse({
    description: 'Register successful',
    type: UserAuthResponseDto,
  })
  register(@Body() registerDto: RegisterDto): Promise<UserAuthResponse> {
    return this.userAuthService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiMessage('Login successful')
  @ApiOkResponse({
    description: 'Login successful',
    type: UserAuthResponseDto,
  })
  login(@Body() loginDto: LoginDto): Promise<UserAuthResponse> {
    return this.userAuthService.login(loginDto);
  }
}
