import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DatabaseRepository } from './database.repository';
import { Product, ProductDocument } from '../model/Product.model.js';

export const ProductsPopulateList = [{ path: 'createdBy' }];

@Injectable()
export class ProductRepositoryService extends DatabaseRepository<ProductDocument> {
  constructor(@InjectModel(Product.name) ProductModel: Model<ProductDocument>) {
    super(ProductModel);
  }
}
