import { Types } from 'mongoose';
import { IAttachmentTypes } from 'src/common/multer/cloud.service';
import { UserDocument } from 'src/DB/model/User.model';
import { ICategory } from '../category/category.interface';
import { IUser } from '../user/user.interface';

export enum Size {
  s = 's',
  m = 'm',
  l = 'l',
  xl = 'xl',
}

export class IProductInput {
  _id?: Types.ObjectId;
  description: string;
  stock: number;
  originalPrice: number;
  discountPercent?: number; 
  size?: Size[];
  color?: string;

  categoryId: Types.ObjectId ;
}
export class IProduct extends IProductInput {
  // _id?: Types.ObjectId;
  slug: string;
  finalPrice: number;

  image: IAttachmentTypes;
  gallery?: IAttachmentTypes[];
  createdBy?: Types.ObjectId | IUser;
  folderId: string;
  updatedAt?: Date;
  createdAt?: Date;
}