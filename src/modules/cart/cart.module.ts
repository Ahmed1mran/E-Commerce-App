import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartRepositoryService } from 'src/DB/repository/Cart.repository.service';
import { ProductRepositoryService } from 'src/DB/repository/Product.repository.service copy';
import { ProductModel } from 'src/DB/model/Product.model';
import { CartModel } from 'src/DB/model/Cart.model';
// import { CartModel } from 'src/DB/model/cart.model';

@Module({
  imports:[ ProductModel, CartModel],
  controllers: [CartController],
  providers: [CartService, CartRepositoryService, ProductRepositoryService],
})
export class CartModule {}
