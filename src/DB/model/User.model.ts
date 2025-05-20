import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { generateHash } from 'src/common/pipes/security/hash.security';

export enum GenderTypes {
  male = 'male',
  female = 'female',
}
export enum RoleTypes {
  user = 'user',
  admin = 'admin',
}

@Schema({
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class User {
  @Virtual({
    get: function (this: User) {
      return `${this.firstName} ${this.lastName}`;
    },
    set: function (value: string) {
      const [firstName, lastName] = value.split(' ');
      this.firstName = firstName;
      this.lastName = lastName;
    },
  })
  username: string;

  @Prop({ required: true, minlength: 2, maxlength: 50, trim: true })
  firstName: string;
  @Prop({ required: true, minlength: 2, maxlength: 50, trim: true })
  lastName: string;
  @Prop({ required: true, unique: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, enum: GenderTypes, default: GenderTypes.male })
  gender: GenderTypes;
  @Prop({ type: String, enum: RoleTypes, default: RoleTypes.user })
  role: RoleTypes;

  @Prop()
  address: string;
  @Prop()
  phone: string;

  @Prop({ type: Date })
  DOB: Date;

  @Prop({ type: Date })
  changeCredentialTime: Date;

  @Prop({ type: Date, default: null })
  confirmEmail: Date | null;

  @Prop({ type: String, default: null })
  confirmEmailOTP: string | null;

  @Prop({ type: Date })
  otpCreatedAt: Date;
}
export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

export const UserModel = MongooseModule.forFeatureAsync([
  {
    name: User.name,
    imports: [],
    useFactory() {
      UserSchema.pre('save', function (next) {
        if (this.isDirectModified('password')) {
          this.password = generateHash(this.password);
        }
        if (this.isDirectModified('confirmEmailOTP')) {
          if (this.confirmEmailOTP) {
            this.confirmEmailOTP = generateHash(this.confirmEmailOTP);
          }
        }
        return next();
      });
      return UserSchema;
    },
  },
]);

export const connectedUsers = new Map();
