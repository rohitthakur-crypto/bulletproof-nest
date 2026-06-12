// import { Controller, Get, Param } from '@nestjs/common';
// import { ApiTags } from '@nestjs/swagger';

// import { UsersService } from '../services/users.service';
// import { UserIdParamDto } from '../validators/user-id.param';

// import { ApiVersion } from '@/common/enums';
// import { ApiMessage } from '@/core/api';

// @ApiTags(SWAGGER_TAGS.USERS)
// @Controller({ path: 'users', version: ApiVersion.V1 })
// export class UsersController {
//   constructor(private readonly usersService: UsersService) {}

//   @Get(':id')
//   @ApiMessage('User fetched successfully')
//   getUser(@Param() params: UserIdParamDto) {
//     return this.usersService.findById(params.id);
//   }
// }
