import {  Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {  Model } from 'mongoose';
// import { DatabaseRepository } from './database.repository';
import { Cart, CartDocument } from '../model/Cart.model';
import { DatabaseRepository } from './database.repository';
// import { Cart, CartDocument } from '../model/Cart.model';

@Injectable()
export class CartRepositoryService <TDocument> extends DatabaseRepository<CartDocument> {
  constructor(
    @InjectModel(Cart.name) CartModel: Model<CartDocument>,
  ) {
    super(CartModel);
  }

}
