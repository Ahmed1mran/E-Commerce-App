import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductRepositoryService } from 'src/DB/repository/Product.repository.service copy';
import { CategoryRepositoryService } from 'src/DB/repository/Category.repository.service';
import { categoryModel } from 'src/DB/model/category.model';
import { ProductModel } from 'src/DB/model/Product.model';
import { CloudService } from 'src/common/multer/cloud.service';
// import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [categoryModel, ProductModel,
    // CacheModule

  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductRepositoryService,
    CategoryRepositoryService,
    CloudService,
  ],
})
export class ProductModule {}
