import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  // ParseEnumPipe,
  // ParseIntPipe,
  Post,
  UsePipes,
  // PipeTransform,
  ValidationPipe,
} from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { CreateAccountDto, LoginDto } from './dto/auth.dto';
import { CustomValidationPipe } from 'src/common/pipes/custom.pipe';
import { MinLength } from 'class-validator';

export class CreateAccountParamDTO {
  @MinLength(2)
  id: string;
}

@UsePipes(
  new CustomValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    stopAtFirstError: false,
  }),
)
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('signup/')
  signUp(
    @Body()
    body: CreateAccountDto,
  ) {
    return this.authenticationService.signup(body);
  }
  @HttpCode(200)
  @Post('login')
  login(
    @Body()
    body: LoginDto,
  ) {
    return this.authenticationService.login(body);
  }
}
