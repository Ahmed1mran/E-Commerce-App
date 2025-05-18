import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserModel } from 'src/DB/model/User.model';
import { TokenService } from 'src/common/service/token.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepositoryService } from 'src/DB/repository/User.repository.service';

@Module({
  imports: [UserModel],
  controllers: [UserController],
  providers: [UserService, TokenService, JwtService, UserRepositoryService],
})
export class UserModule {}
