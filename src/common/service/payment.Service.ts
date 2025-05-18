import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { OrderDocument } from 'src/DB/model/Order.model';
import { OrderRepositoryService } from 'src/DB/repository/Order.repository.service';
import { OrderStatus } from 'src/modules/order/order.interface';
import Stripe from 'stripe';

@Injectable()
export class paymentSercvice {
  private stripe: Stripe;

  constructor(
    private readonly orderRepositoryService: OrderRepositoryService<OrderDocument>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET as string);
  }
  async checkoutSession({
    customer_email,
    mode = 'payment',
    cancel_url = process.env.CANCEL_URL,
    success_url = process.env.SUCCESS_URL,
    metadata = {},
    line_items,
    discounts = [],
  }: Stripe.Checkout.SessionCreateParams): Promise<
    Stripe.Response<Stripe.Checkout.Session>
  > {
    const session = await this.stripe.checkout.sessions.create({
      customer_email,
      mode,
      cancel_url,
      success_url,
      metadata,
      line_items,
      discounts,
    });
    return session;
  }

  async createCoupon(
    params: Stripe.CouponCreateParams,
  ): Promise<Stripe.Response<Stripe.Coupon>> {
    const coupon = await this.stripe.coupons.create(params);

    return coupon;
  }

  async webhook(req: any) {
    let body = req.body;
    console.log('body');
    console.log({ body });
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const signature = req.headers['stripe-signature'];
    if (!endpointSecret) {
      throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable');
    }

    const event = this.stripe.webhooks.constructEvent(
      body,
      signature,
      endpointSecret,
    );

    console.log({ event });
    console.log({ event: event.data.object['metadata'].orderId });
    if (event.type != 'checkout.session.completed') {
      throw new BadRequestException('fail to pay');
    }
    const metadata = event?.data?.object?.metadata;

    if (!metadata || !metadata.orderId) {
      throw new BadRequestException('orderId not found in metadata');
    }

    const order = await this.orderRepositoryService.findOne({
      filter: {
        _id: metadata.orderId,
        status: OrderStatus.pending,
      },
    });
    if (!order?.intentId) {
      throw new BadRequestException('order or intentId not found');
    }

    await this.confirmPaymentIntent(order.intentId);

    await this.orderRepositoryService.updateOne({
      filter: {
        _id: metadata.orderId,
        status: OrderStatus.pending,
      },
      data: {
        status: OrderStatus.placed,
        paidAt: Date.now(),
      },
    });

    return 'Done';
  }
  async createPaymentIntent(
    amount: number,
    currency = 'egp',
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    const paymentMethod = await this.createPaymentMethod();
    console.log({ paymentMethod });
    const intent = await this.stripe.paymentIntents.create({
      // amount: Math.round(amount * 100),
      amount: amount * 100,
      currency,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      payment_method: paymentMethod.id,
    });
    console.log({ intent });
    return intent;
  }

  async createPaymentMethod(
    token: string = 'tok_visa',
  ): Promise<Stripe.Response<Stripe.PaymentMethod>> {
    const paymentMethod = await this.stripe.paymentMethods.create({
      type: 'card',
      card: {
        token,
      },
    });
    return paymentMethod;
  }

  async retrievePaymentIntent(
    id: string,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(id);
    return paymentIntent;
  }
  async confirmPaymentIntent(
    id: string,
    // params: Stripe.PaymentIntentConfirmParams,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    const intent = await this.retrievePaymentIntent(id);
    if (!intent) {
      throw new BadRequestException('In-Valid intent');
    }
    const paymentIntent = await this.stripe.paymentIntents.confirm(intent.id, {
      payment_method: 'pm_card_visa',
    });
    console.log({ paymentIntent });
    if (paymentIntent.status != 'succeeded') {
      throw new BadRequestException('fail to confirm payment intent');
    }
    return paymentIntent;
  }
  async refund(
    id: string,
    // params: Stripe.PaymentIntentConfirmParams,
  ): Promise<Stripe.Response<Stripe.Refund>> {
    const refund = await this.stripe.refunds.create({
      payment_intent: id,
    })
    return refund;
  }
}
