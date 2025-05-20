import { Types } from 'mongoose';
import { IUser } from '../user/user.interface';
import { IProduct } from '../product/product.interface';

export enum OrderStatus {
  pending = 'pending',
  placed = 'placed',
  onWay = 'on_way',
  delivered = 'delivered',
  cancelled = 'cancelled',
  accepted = 'accepted',
}
export enum PaymentMethod {
  cash = 'cash',
  Card = 'card',
}

export interface IOrderProduct {
  _id?: Types.ObjectId;
  productId: Types.ObjectId | IProduct;
  name: string;
  quantity: number;
  unitPrice: number;
  finalPrice: number;
}
export interface IOrderInputs {
  address: string;
  phone: string;
  note?: string;
  paymentMethod: PaymentMethod;
}
export interface IOrder extends IOrderInputs {
  _id?: Types.ObjectId;

  orderId: string;

  createdBy: Types.ObjectId | IUser;
  updatedBy?: Types.ObjectId | IUser;

  createdAt?: Date;
  updatedAt?: Date;

  paidAt?: Date;

  rejectedReason?: string;

  products: IOrderProduct[];
  intentId?: string;
  status: OrderStatus;
  subTotal: number;
  discountAmount?: number;
  finalPrice: number;
}
