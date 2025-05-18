import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UserDocument } from 'src/DB/model/User.model';
import { CartRepositoryService } from 'src/DB/repository/Cart.repository.service';
import { CartDocument } from 'src/DB/model/Cart.model';
import {
  IOrder,
  IOrderProduct,
  OrderStatus,
  PaymentMethod,
} from './order.interface';
import { ProductRepositoryService, ProductsPopulateList } from 'src/DB/repository/Product.repository.service copy';
import { Product, ProductDocument } from 'src/DB/model/Product.model';
import { OrderRepositoryService } from 'src/DB/repository/Order.repository.service';
import { OrderDocument } from 'src/DB/model/Order.model';
import { CartService } from '../cart/cart.service';
import { Types } from 'mongoose';
import { paymentSercvice } from 'src/common/service/payment.Service';
// import { Order } from './entities/order.entity';
import Stripe from 'stripe';
import { Request } from 'express';
import { RealTimeGateWay } from '../gateway/gateway';

@Injectable()
export class OrderService {
  constructor(
    private readonly cartRepositoryService: CartRepositoryService<CartDocument>,
    private readonly productRepositoryService: ProductRepositoryService<ProductDocument>,
    private readonly orderRepositoryService: OrderRepositoryService<OrderDocument>,
    private readonly cartService: CartService,
    private paymentService: paymentSercvice,
    private realTimeGateWay: RealTimeGateWay,
  ) {}
  async create(
    user: UserDocument,
    body: CreateOrderDto,
  ): Promise<{ message: string }> {
    const cart = await this.cartRepositoryService.findOne({
      filter: { createdBy: user._id },
    });
    if (!cart?.products?.length) {
      throw new BadRequestException('Cart not found or empty');
    }
    // if (cart.items.length === 0) {
    // }
    // return { message: 'This action adds a new order' };

    let subTotal: number = 0;
    let products: IOrderProduct[] = [];
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
    const order = await this.orderRepositoryService.create({
      ...body,
      subTotal,
      discountAmount: body.discountPercent,
      products,
      createdBy: user._id,
      finalPrice,
    });

    // await this.cartService.clearCart(user);

    interface ProductStock {
      productId: Types.ObjectId;
      stock: number;
    }

    let productsStock: ProductStock[] = [];

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
    // let discounts = [];
    let discounts = [] as Array<{ coupon: string }>;

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
      // filter:{}
      populate: [
        { path: 'createdBy' },
        {
          path: 'products',
          populate: { path: 'productId', populate: ProductsPopulateList },
        },
      ],
    });
    // console.log(orders);
    return orders;
  }
}
