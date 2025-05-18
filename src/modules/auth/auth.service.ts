import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAccountDto, LoginDto } from './dto/auth.dto';
import { User, UserDocument } from 'src/DB/model/User.model';
import { Model } from 'mongoose';
import { UserRepositoryService } from 'src/DB/repository/User.repository.service';
import {
  compareHash,
  generateHash,
} from 'src/common/pipes/security/hash.security';
import { sendEmail } from 'src/common/email/send.email';
import { VerifyAccountTemplate } from 'src/common/email/template.email';
import { customAlphabet } from 'nanoid';
import { sign, verify } from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/common/service/token.service';
@Injectable()
export class AuthenticationService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userRepositoryService: UserRepositoryService,
  ) {}

  async signup(body: CreateAccountDto): Promise<any> {
    const { username, email, password } = body;
    const otp = this.generateRandomCode();
    await this.userRepositoryService.checkDuplicateAccount({ email });
    const user = await this.userRepositoryService.create({
      username,
      email,
      password,
      otp: `${otp}`,
    });

    sendEmail({
      to: email,
      subject: 'Confirm-Email',
      html: VerifyAccountTemplate(otp),
    });
    return { message: 'Done', user };
  }

  async login(body: LoginDto): Promise<any> {
    const { email, password } = body;
    const user = await this.userRepositoryService.findOne({
      filter: { email },
    });
    if (!user || !compareHash(password, user.password)) {
      throw new BadRequestException('In-valid Login Data');
    }

    // const token = sign({ id: user._id }, 'asfjkahf', { expiresIn: '1y' });

    // const token = await this.jwtService.signAsync(
    //   { id: user._id },
    //   { secret: 'afljklnaal', expiresIn: '1y' },
    // );

    const token = this.tokenService.sign({
      payload: { id: user._id },
    });
    return { message: 'Done', token };
  }
  generateRandomCode() {
    return Math.floor(Math.random() * (999999 - 10000 + 1) + 100000);
    // const otp = customAlphabet('0123456789', 4)();
    // const hashOTP = generateHash({ plainText: `${otp}` });
    // return otp;
  }
}
