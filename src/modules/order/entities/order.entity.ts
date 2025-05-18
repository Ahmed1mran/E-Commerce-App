import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  IOrder,
  IOrderProduct,
  OrderStatus,
  PaymentMethod,
} from '../order.interface';
import { Types } from 'mongoose';
import { OneProductResponse } from 'src/modules/product/entities/product.entity';
import { IUser } from 'src/modules/user/user.interface';
import { OneUserResponse } from 'src/modules/user/entities/user.entity';
import { IProduct } from 'src/modules/product/product.interface';

registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
});
registerEnumType(OrderStatus, {
  name: 'OrderStatus',
});

@ObjectType()
export class IOrderProductResponse implements IOrderProduct {
  @Field(() => ID)
  _id?: Types.ObjectId;
  @Field(() => Number, { nullable: false })
  finalPrice: number;
  @Field(() => String)
  name: string;

  @Field(() => Number, { nullable: false })
  quantity: number;
  @Field(() => Number, { nullable: false })
  unitPrice: number;

  @Field(() => OneProductResponse)
  productId: IProduct;
}
@ObjectType()
export class OneOrderResponse implements IOrder {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field(() => String)
  address: string;

  @Field(() => String, { nullable: true })
  note?: string;
  @Field(() => String, { nullable: false })
  orderId: string;
  @Field(() => OneUserResponse)
  createdBy: IUser;
  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Number, { nullable: true })
  discountAmount?: number;
  @Field(() => ID, { nullable: true })
  updatedBy?: Types.ObjectId;
  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
  @Field(() => Date, { nullable: true })
  paidAt?: Date;
  @Field(() => String, { nullable: true })
  rejectedReason?: string;
  @Field(() => String, { nullable: true })
  intentId?: string;
  @Field(() => OrderStatus)
  status: OrderStatus;
  @Field(() => Number, { nullable: false })
  subTotal: number;
  @Field(() => Number, { nullable: false })
  finalPrice: number;
  @Field(() => PaymentMethod)
  paymentMethod: PaymentMethod;
  @Field(() => String, { nullable: false })
  phone: string;

  @Field(() => [IOrderProductResponse])
  products: IOrderProduct[];
}
