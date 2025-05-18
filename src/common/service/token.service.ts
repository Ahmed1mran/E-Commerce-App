import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { UserDocument } from 'src/DB/model/User.model';
import { UserRepositoryService } from 'src/DB/repository/User.repository.service';

export interface ITokenPayload extends JwtPayload {
  id: Types.ObjectId;
}
@Injectable()
export class TokenService {
  constructor(
    private userRepositoryService: UserRepositoryService,
    private readonly jwt: JwtService,
  ) {}
  
  sign({
    payload,
    secret = process.env.TOKEN_SIGNATURE,
    expiresIn = 3600,
  }: {
    payload: ITokenPayload;
    secret?: string;
    expiresIn?: number;
  }) {
    const token = this.jwt.sign(payload, {
      secret,
      expiresIn,
    });
    return token;
  }
  async verify({
    authorization,
    secret = process.env.TOKEN_SIGNATURE,
  }: {
    authorization: string | undefined;
    secret?: string;
  }): Promise<UserDocument> {
    if (!authorization) {
      throw new BadRequestException('Missing authorization header');
    }
    const [bearer, token] = authorization?.split(' ') || [];
    if (!bearer || !token) {
      throw new BadRequestException('missing token');
    }
    if (bearer !== 'Bearer' || !token) {
      throw new BadRequestException('Invalid authorization format');
    }
    try {
      const decoded = this.jwt.verify(token, { secret });
      if (!decoded.id) {
        throw new BadRequestException('Invalid token payload: Missing ID');
      }

      const user = await this.userRepositoryService.findOne({
        filter: { _id: new Types.ObjectId(decoded.id) },
      });
      if (!user) {
        throw new NotFoundException('Not register account');
      }
      return user;
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      throw new BadRequestException('Invalid token');
    }
  }
  
/*
  sign({
    payload,
    secret = process.env.TOKEN_SIGNATURE,
    expiresIn = 3600,
    type = 'user', // افتراضيًا يكون "user"
  }: {
    payload: ITokenPayload;
    secret?: string;
    expiresIn?: number;
    type?: 'user' | 'admin';
  }) {
    const token = this.jwt.sign(payload, {
      secret,
      expiresIn,
    });

    return type === 'admin' ? `System ${token}` : `Bearer ${token}`;
  }
  async verify({
    authorization,
    secret = process.env.TOKEN_SIGNATURE,
  }: {
    authorization: string;
    secret?: string;
  }): Promise<UserDocument> {
    if (!authorization) {
      throw new BadRequestException('Missing authorization header');
    }

    const [prefix, token] = authorization.split(' ');

    if (!prefix || !token) {
      throw new BadRequestException('Missing token');
    }

    if (!['Bearer', 'System'].includes(prefix)) {
      throw new BadRequestException('Invalid authorization format');
    }

    try {
      const decoded = this.jwt.verify(token, { secret });

      if (!decoded.id) {
        throw new BadRequestException('Invalid token payload: Missing ID');
      }

      // البحث عن المستخدم في قاعدة البيانات
      const user = await this.userRepositoryService.findOne({
        filter: { _id: new Types.ObjectId(decoded.id) },
      });

      if (!user) {
        throw new NotFoundException('Not registered account');
      }

      return user;
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      throw new BadRequestException('Invalid token');
    }
  }
  */
}
