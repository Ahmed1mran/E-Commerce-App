import { Types } from 'mongoose';

export interface ICartProduct {
  _id?: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
}
export interface ICart {
  _id?: Types.ObjectId;
  products: ICartProduct[];

  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
