import {  Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {  Model } from 'mongoose';
import { DatabaseRepository } from './database.repository';
import { Category, CategoryDocument } from '../model/category.model.js';

@Injectable()
export class CategoryRepositoryService extends DatabaseRepository<CategoryDocument> {
  constructor(
    @InjectModel(Category.name) CategoryModel: Model<CategoryDocument>,
  ) {
    super(CategoryModel);
  }
  // async updateOne(params: { filter: any; data: any }): Promise<any> {
  //   return this.model.updateOne(params.filter, params.data);
  // }
}
