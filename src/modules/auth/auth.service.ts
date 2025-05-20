import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfirmEmailDto, CreateAccountDto, LoginDto } from './dto/auth.dto';
import { UserRepositoryService } from 'src/DB/repository/User.repository.service';
import {
  compareHash,
  generateHash,
} from 'src/common/pipes/security/hash.security';
import { sendEmail } from 'src/common/email/send.email';
import { VerifyAccountTemplate } from 'src/common/email/template.email';
import { TokenService } from 'src/common/service/token.service';
import { isBefore, addMinutes } from 'date-fns';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userRepositoryService: UserRepositoryService,
  ) {}

  async signup(body: CreateAccountDto): Promise<any> {
    const { username, email, password } = body;
    const otp = this.generateRandomCode();
    const otpCreatedAt = new Date();

    await this.userRepositoryService.checkDuplicateAccount({ email });

    const hashedOtp = generateHash(`${otp}`);

    const user = await this.userRepositoryService.create({
      username,
      email,
      password,
      confirmEmailOTP: hashedOtp,
      otpCreatedAt,
      confirmEmail: null,
    });

    sendEmail({
      to: email,
      subject: 'Confirm-Email',
      html: VerifyAccountTemplate(otp),
    });

    return { message: 'Done', user };
  }

  async confirmEmail(body: ConfirmEmailDto) {
    const { email, otp } = body;

    const user = await this.userRepositoryService.findOne({
      filter: { email },
    });

    if (!user) {
      throw new BadRequestException('Invalid email');
    }
    if (user.confirmEmail) {
      throw new BadRequestException('Email already confirmed');
    }
    if (!user.confirmEmailOTP) {
      throw new BadRequestException('OTP expired or not found');
    }

    if (isBefore(addMinutes(user.otpCreatedAt, 10), new Date())) {
      throw new BadRequestException('OTP expired');
    }

    const isOTPValid = compareHash(otp, user.confirmEmailOTP);

    if (!isOTPValid) {
      throw new BadRequestException('Invalid OTP');
    }

    user.confirmEmail = new Date();
    user.confirmEmailOTP = null; // مسحه بعد التأكيد
    if (
      !user.otpCreatedAt ||
      isBefore(addMinutes(user.otpCreatedAt, 10), new Date())
    ) {
      throw new BadRequestException('OTP expired');
    }

    await this.userRepositoryService.updateOne({
      filter: { _id: user._id },
      data: { confirmEmail: user.confirmEmail, confirmEmailOTP: null },
    });

    return { message: 'Email confirmed successfully' };
  }
  async resendConfirmEmailOTP(email: string) {
    const user = await this.userRepositoryService.findOne({
      filter: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.confirmEmail) {
      throw new BadRequestException('Email already confirmed');
    }

    const newOTP = this.generateRandomCode();
    const hashedOTP = generateHash(newOTP.toString());
    user.confirmEmailOTP = hashedOTP;
    user.otpCreatedAt = new Date();

    await this.userRepositoryService.updateOne({
      filter: { _id: user._id },
      data: {
        confirmEmail: user.confirmEmail,
        confirmEmailOTP: user.confirmEmailOTP,
        otpCreatedAt: user.otpCreatedAt,
      },
    });

    await sendEmail({
      to: email,
      subject: 'Confirm-Email',
      html: VerifyAccountTemplate(newOTP),
    });

    return { message: 'New confirmation OTP sent to your email' };
  }

  async login(body: LoginDto): Promise<any> {
    const { email, password } = body;
    const user = await this.userRepositoryService.findOne({
      filter: { email },
    });
    if (!user || !compareHash(password, user.password)) {
      throw new BadRequestException('In-valid Login Data');
    }

    if (!user.confirmEmail) {
      throw new BadRequestException('Please confirm your email before login');
    }

    const token = this.tokenService.sign({
      payload: { id: user._id },
    });
    return { message: 'Done', token };
  }

  generateRandomCode() {
    return Math.floor(Math.random() * (999999 - 10000 + 1) + 100000);
  }
}
