import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DatabaseRepository } from './database.repository';
import { Product, ProductDocument } from '../model/Product.model.js';


export  const ProductsPopulateList = [
  { path: 'createdBy' },
  
  // { path: 'categoryId' },
  
  // { path: 'updatedBy' },
  
  

] 

@Injectable()
export class ProductRepositoryService<
  TDocument,
> extends DatabaseRepository<ProductDocument> {
  constructor(@InjectModel(Product.name) ProductModel: Model<ProductDocument>) {
    super(ProductModel);
  }
}
