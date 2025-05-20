import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from '../model/Cart.model';
import { DatabaseRepository } from './database.repository';

@Injectable()
export class CartRepositoryService extends DatabaseRepository<CartDocument> {
  constructor(@InjectModel(Cart.name) CartModel: Model<CartDocument>) {
    super(CartModel);
  }
}
