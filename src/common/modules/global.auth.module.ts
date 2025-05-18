import { Global, Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserModel } from "src/DB/model/User.model";
import { UserRepositoryService } from "src/DB/repository/User.repository.service";
import { TokenService } from "../service/token.service";
import { AuthenticationService } from "src/modules/auth/auth.service";

@Global()
@Module({
  imports: [UserModel],
//   controllers: [AuthenticationController], 
  providers: [
    AuthenticationService,
    UserRepositoryService,
    JwtService,
    TokenService,
  ],
  exports: [UserModel, UserRepositoryService, JwtService, TokenService],

})

export class GlobalAuthenticationModule {}