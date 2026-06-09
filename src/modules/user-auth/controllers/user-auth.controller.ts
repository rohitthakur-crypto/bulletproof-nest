import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../decorators/current-user.decorator';
import {
  AuthTokenResponseDto,
  UserAuthResponseDto,
  type AuthTokenResponse,
  type UserAuthResponse,
} from '../dto';
import { UserAuthGuard } from '../guards';
import type { AuthenticatedUser } from '../interfaces';
import { UserAuthService } from '../services/user-auth.service';
import { LoginDto } from '../validators/login.schema';
import { RefreshDto } from '../validators/refresh.schema';
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

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiMessage('Refresh token successful')
  @ApiOkResponse({
    description: 'Refresh token successful',
    type: AuthTokenResponseDto,
  })
  refresh(@Body() refreshDto: RefreshDto): Promise<AuthTokenResponse> {
    return this.userAuthService.refresh(refreshDto);
  }

  @Post('logout')
  @UseGuards(UserAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiMessage('Logout successful')
  @ApiOkResponse({
    description: 'Logout successful',
  })
  logout(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    return this.userAuthService.logout(user);
  }
}
