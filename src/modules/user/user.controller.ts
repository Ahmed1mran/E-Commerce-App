import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  SetMetadata,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticationGuard, IAuthReq } from 'src/common/guard/authentication/authentication.guard';
import { Request } from 'express';
import { log } from 'console';
import { User } from 'src/common/decorators/user.decorator';
import { RoleTypes, UserDocument } from 'src/DB/model/User.model';
import { AuthorizationGuard } from 'src/common/guard/authorization/authorization.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Auth } from 'src/common/decorators/auth.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Roles( [RoleTypes.user])
  // @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Auth(RoleTypes.admin)
  @Get('profile')
  profile(@User() user: UserDocument) {
    return this.userService.profile(user);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
