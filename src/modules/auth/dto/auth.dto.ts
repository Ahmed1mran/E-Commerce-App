import {
  IsEmail,
  IsString,
  IsStrongPassword,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsMatchPassword } from 'src/common/pipes/decorators/password.custom.decorator';

export class CreateAccountParamDTO {
  @MinLength(2)
  id: string;
}
export class LoginDto {
  @IsEmail()
  email: string;
  @IsStrongPassword()
  password: string;
}
export class CreateAccountDto extends LoginDto {
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  username: string;

  @IsMatchPassword('password', {
    message: 'Password not = confirm password',
  })
  confirmPassword: string;
}
export class ConfirmEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  otp: string;
}
