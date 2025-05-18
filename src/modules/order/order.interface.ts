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
  // rejected = 'rejected',
}
export enum PaymentMethod {
  cash = 'cash',
  Card = 'card',
  // paypal = 'paypal',
  // stripe = 'stripe',
  // bankTransfer = 'bank_transfer',
  // applePay = 'apple_pay',
  // googlePay = 'google_pay',
}

export interface IOrderProduct {
  _id?: Types.ObjectId;
  productId: Types.ObjectId | IProduct;
  name: string;
  quantity: number;
  unitPrice: number;
  finalPrice: number;

  // product: Types.ObjectId;
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
  updatedBy?: Types.ObjectId | IUser ;

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
