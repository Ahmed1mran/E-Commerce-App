import { Types } from 'mongoose';
import { IAttachmentTypes } from 'src/common/multer/cloud.service';


export interface ICreateCategoryInput{
  name: string;
}
export interface ICategory extends ICreateCategoryInput {
  _id?: Types.ObjectId;

  name: string;

  slug: string;

  logo: IAttachmentTypes;

  folderId: string;

  createdBy?: Types.ObjectId;

  createdAt?: Date;

  updatedAt?: Date;
}
