import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PopulateOptions } from 'mongoose';
import { User, UserDocument, UserModel } from '../model/User.model';
import { DatabaseRepository } from './database.repository';

@Injectable()
export class UserRepositoryService extends DatabaseRepository<UserDocument> {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<UserDocument>,
  ) {
    super(UserModel);
  }
  async checkDuplicateAccount(data: FilterQuery<UserDocument>): Promise<null> {
    const checkUser = await this.findOne({
      filter: data,
    });
    if (checkUser) {
      throw new ConflictException('Email exist');
    }
    return null;
  }
}
