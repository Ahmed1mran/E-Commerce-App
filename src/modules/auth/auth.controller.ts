import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { ConfirmEmailDto, CreateAccountDto, LoginDto } from './dto/auth.dto';
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
  @Post('confirm-email')
  confirmEmail(@Body() body: ConfirmEmailDto) {
    return this.authenticationService.confirmEmail(body);
  }

  @Post('resend-otp')
  resendOtp(@Body('email') email: string) {
    return this.authenticationService.resendConfirmEmailOTP(email);
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
