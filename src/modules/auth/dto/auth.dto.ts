import {
  IsEmail,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
  Validate,
  validate,
  ValidateIf,
} from 'class-validator';
import { IsMatchPassword } from 'src/common/pipes/decorators/password.custom.decorator';
// import { isMatchPassword } from 'src/common/pipes/decorators/password.custom.decorator';

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

// import {
//     IsEmail,
//     IsOptional,
//     IsString,
//     IsStrongPassword,
//     MaxLength,
//     MinLength,
//   } from 'class-validator';

// export class CreateAccountDto {
//   @IsString({ message: 'please provide username' })
//   @MinLength(2)
//   @MaxLength(20)
//   username: string;
//   @IsEmail()
// //   @IsOptional()
//   email: string;
//   @IsStrongPassword()
//   password: string;
//   @IsStrongPassword()
//   confirmPassword: string;
// }
