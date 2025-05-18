import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartRepositoryService } from 'src/DB/repository/Cart.repository.service';
import { CartModel } from 'src/DB/model/Cart.model';
import { ProductRepositoryService } from 'src/DB/repository/Product.repository.service copy';
import { ProductModel } from 'src/DB/model/Product.model';
import { OrderRepositoryService } from 'src/DB/repository/Order.repository.service';
import { CartService } from '../cart/cart.service';
import { OrderModel } from 'src/DB/model/Order.model';
import { paymentSercvice } from 'src/common/service/payment.Service';
import { RealTimeGateWay } from '../gateway/gateway';
import { OrderResolver } from './order.resolver';

@Module({
  imports: [CartModel, ProductModel, OrderModel],
  controllers: [OrderController],
  providers: [
    OrderService,
    CartRepositoryService,
    ProductRepositoryService,
    OrderRepositoryService,
    CartService,
    paymentSercvice,
    RealTimeGateWay,
    OrderResolver,
  ],
})
export class OrderModule {}
