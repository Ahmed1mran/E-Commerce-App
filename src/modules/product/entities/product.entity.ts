import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Types } from "mongoose";
import { IProduct, Size } from "../product.interface";
import { IUser } from "src/modules/user/user.interface";
import { IAttachmentTypes } from "src/common/multer/cloud.service";
import { OneUserResponse } from "src/modules/user/entities/user.entity";

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

    
//   @Field(() => String)
//   description?: string;
  
//   discountPercent?: number;
//   finalPrice?: number;
//   folderId?: string;

//   gallery?: IAttachmentTypes[];

//   image?: IAttachmentTypes;
//   originalPrice?: number;
//   size?: Size[];
//   slug?: string;
//   stock?: number;
//   updatedAt?: Date;
}