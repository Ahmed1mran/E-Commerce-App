import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DatabaseRepository } from './database.repository';
import { Order, OrderDocument } from '../model/Order.model';

@Injectable()
export class OrderRepositoryService extends DatabaseRepository<OrderDocument> {
  constructor(@InjectModel(Order.name) OrderModel: Model<OrderDocument>) {
    super(OrderModel);
  }
}
