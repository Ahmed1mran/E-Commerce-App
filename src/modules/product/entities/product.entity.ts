import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { IProduct } from '../product.interface';
import { IUser } from 'src/modules/user/user.interface';
import { OneUserResponse } from 'src/modules/user/entities/user.entity';

@ObjectType()
export class OneProductResponse implements Partial<IProduct> {
  @Field(() => ID)
  _id: Types.ObjectId;
  @Field(() => String)
  name: string;
  @Field(() => ID)
  categoryId?: Types.ObjectId;
  @Field(() => [String])
  color?: string;
  @Field(() => Date)
  createdAt?: Date;
  @Field(() => OneUserResponse)
  createdBy?: IUser;
}
