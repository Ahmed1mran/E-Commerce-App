import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { categoryModel } from 'src/DB/model/category.model';
import { CategoryRepositoryService } from 'src/DB/repository/Category.repository.service';
import { CloudService } from 'src/common/multer/cloud.service';

@Module({
  imports: [categoryModel, categoryModel],
  controllers: [CategoryController],
  providers: [CategoryService, CloudService, CategoryRepositoryService],
})
export class CategoryModule {}
