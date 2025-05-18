import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IUser } from '../user.interface';
import { GenderTypes, RoleTypes } from 'src/DB/model/User.model';

registerEnumType(RoleTypes, {
  name: 'RoleTypes',
});

registerEnumType(GenderTypes, {
  name: 'GenderTypes',
});
@ObjectType()
export class OneUserResponse implements Partial<IUser> {
  @Field(() => String)
  firstName: string;
  @Field(() => String)
  lastName: string;
  @Field(() => String, { nullable: true })
  username?: string;
  @Field(() => String)
  email: string;
  @Field(() => String)
  password: string;
  @Field(() => GenderTypes)
  gender: GenderTypes;
  @Field(() => String, { nullable: true })
  phone?: string;
  @Field(() => Date, { nullable: true })
  confirmEmail?: Date;
  @Field(() => String, { nullable: true })
  confirmEmailOTP?: string;
  @Field(() => Date, { nullable: true })
  DOB?: Date;
  @Field(() => String, { nullable: true })
  address?: string;
  @Field(() => Date, { nullable: true })
  changeCredentialTime?: Date;
  @Field(() => RoleTypes)
  role?: RoleTypes;
  @Field(() => Date)
  createdAt: Date;
  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
  //   otp?: string;
}
