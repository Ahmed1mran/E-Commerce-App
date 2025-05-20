import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UserDocument } from 'src/DB/model/User.model';
import { CartRepositoryService } from 'src/DB/repository/Cart.repository.service';
import { IOrderProduct, OrderStatus, PaymentMethod } from './order.interface';
import {
  ProductRepositoryService,
  ProductsPopulateList,
} from 'src/DB/repository/Product.repository.service copy';
import { OrderRepositoryService } from 'src/DB/repository/Order.repository.service';
import { CartService } from '../cart/cart.service';
import { Types } from 'mongoose';
import { paymentSercvice } from 'src/common/service/payment.Service';
import Stripe from 'stripe';
import { Request } from 'express';
import { RealTimeGateWay } from '../gateway/gateway';
import { UserRepositoryService } from 'src/DB/repository/User.repository.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly cartRepositoryService: CartRepositoryService,
    private readonly productRepositoryService: ProductRepositoryService,
    private readonly orderRepositoryService: OrderRepositoryService,
    private readonly userRepositoryService: UserRepositoryService,
    private readonly cartService: CartService,
    private paymentService: paymentSercvice,
    private realTimeGateWay: RealTimeGateWay,
  ) {}
  async create(
    user: UserDocument,
    body: CreateOrderDto,
  ): Promise<{ message: string }> {
    const existingUser = await this.userRepositoryService.findOne({
      filter: { _id: user._id },
    });
    if (!existingUser) {
      throw new BadRequestException('User not found');
    }
    if (!existingUser.confirmEmail) {
      throw new BadRequestException('Email is not confirmed');
    }
    const cart = await this.cartRepositoryService.findOne({
      filter: { createdBy: user._id },
    });
    if (!cart?.products?.length) {
      throw new BadRequestException('Cart not found or empty');
    }
    let subTotal: number = 0;
    const products: IOrderProduct[] = [];
    for (const product of cart.products) {
      const checkProduct = await this.productRepositoryService.findOne({
        filter: {
          _id: product.productId,
          stock: { $gte: product.quantity },
        },
      });
      if (!checkProduct) {
        throw new BadRequestException(
          'Product not found or out of stock ' + product.productId,
        );
      }
      products.push({
        name: checkProduct.name,
        productId: product.productId,
        quantity: product.quantity,
        unitPrice: checkProduct.finalPrice,
        finalPrice: product.quantity * checkProduct.finalPrice,
      });
      subTotal += product.quantity * checkProduct.finalPrice;
    }
    let finalPrice = subTotal;
    if (body.discountPercent) {
      finalPrice = Math.floor(
        subTotal - (body.discountPercent / 100) * subTotal,
      );
    }
     await this.orderRepositoryService.create({
      ...body,
      subTotal,
      discountAmount: body.discountPercent,
      products,
      createdBy: user._id,
      finalPrice,
    });

    await this.cartService.clearCart(user);

    interface ProductStock {
      productId: Types.ObjectId;
      stock: number;
    }

    const productsStock: ProductStock[] = [];

    for (const product of products) {
      const item = await this.productRepositoryService.findOneAndUpdate({
        filter: { _id: product.productId },
        data: { $inc: { stock: -product.quantity } },
      });

      if (item && item._id && typeof item.stock === 'number') {
        productsStock.push({ productId: item._id, stock: item.stock });
      }
    }

    this.realTimeGateWay.emitStockChanges(productsStock);
    return { message: 'Done' };
  }
  async checkout(
    user: UserDocument,
    orderId: Types.ObjectId,
  ): Promise<{
    message: string;
    data: {
      session: Stripe.Response<Stripe.Checkout.Session>;
      client_secret: any;
    };
  }> {
    const order = await this.orderRepositoryService.findOne({
      filter: {
        _id: orderId,
        createdBy: user._id,
        status: OrderStatus.pending,
        paymentMethod: PaymentMethod.Card,
      },
    });
    if (!order) {
      throw new BadRequestException('In-Valid order');
    }
    const discounts = [] as Array<{ coupon: string }>;

    if (order.discountAmount) {
      const coupon = await this.paymentService.createCoupon({
        percent_off: order.discountAmount,
        duration: 'once',
      });
      console.log(coupon);
      discounts.push({ coupon: coupon.id });
    }
    const session = await this.paymentService.checkoutSession({
      line_items: order.products.map((product) => {
        return {
          quantity: product.quantity,
          price_data: {
            product_data: {
              name: product.name,
            },
            currency: 'egp',
            unit_amount: product.unitPrice * 100,
          },
        };
      }),
      metadata: {
        orderId: orderId as unknown as string,
      },
      cancel_url: `${process.env.CANCEL_URL}/order${orderId}/cancel`,
      success_url: `${process.env.SUCCESS_URL}/order${orderId}/success`,
      discounts,
    });
    const intent = await this.paymentService.createPaymentIntent(
      order.finalPrice,
    );
    console.log({ intent });

    await this.orderRepositoryService.updateOne({
      filter: { _id: orderId },
      data: { intentId: intent.id },
    });
    return {
      message: 'Done',
      data: { session, client_secret: intent.client_secret },
    };
  }
  async webhook(req: Request) {
    console.log('start 2');
    console.log('Method:', req.method);
    console.log('Content-Type:', req.headers['content-type']);

    return this.paymentService.webhook(req);
  }
  async cancelOrder(
    user: UserDocument,
    orderId: Types.ObjectId,
  ): Promise<{ message: string }> {
    const order = await this.orderRepositoryService.findOne({
      filter: {
        _id: orderId,
        createdBy: user._id,
        $or: [{ status: OrderStatus.pending }, { status: OrderStatus.placed }],
      },
    });

    if (!order) {
      throw new BadRequestException('Invalid order');
    }

    let refund = {};
    if (
      order.paymentMethod === PaymentMethod.Card &&
      order.status === OrderStatus.placed
    ) {
      if (!order.intentId) {
        throw new BadRequestException('Missing intent ID for card payment');
      }
      refund = { refundAmount: order.finalPrice, refundDate: Date.now() };
      await this.paymentService.refund(order.intentId);
    }

    // refund
    await this.orderRepositoryService.updateOne({
      filter: { _id: orderId },
      data: {
        status: OrderStatus.cancelled,
        ...refund,
        updatedBy: user._id,
      },
    });
    for (const product of order.products) {
      await this.productRepositoryService.updateOne({
        filter: {
          _id: product.productId,
        },
        data: {
          $inc: { stock: product.quantity },
        },
      });
    }
    return { message: 'Done' };
  }

  async findAll(): Promise<any> {
    const orders = await this.orderRepositoryService.find({
      populate: [
        { path: 'createdBy' },
        {
          path: 'products',
          populate: { path: 'productId', populate: ProductsPopulateList },
        },
      ],
    });
    return orders;
  }
}
