import { GenderTypes, RoleTypes } from 'src/DB/model/User.model';

export interface IUser {
  username?: string;

  firstName: string;
  lastName: string;
  email: string;

  password: string;

  gender: GenderTypes;
  role: RoleTypes;

  address: string;
  phone: string;
  changeCredentialTime?: Date;
  DOB?: Date;
  confirmEmail?: Date;
  confirmEmailOTP?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
