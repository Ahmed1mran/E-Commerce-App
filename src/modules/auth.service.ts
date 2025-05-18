import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './auth/dto/auth.dto';

@Injectable()
export class AuthenticationService {
  private user: any[] = [];
  constructor() {}

  signup(body: CreateAccountDto): { message: string; users: any } {
    this.user.push(body);
    return { message: 'Done', users: this.user };
  }
}
