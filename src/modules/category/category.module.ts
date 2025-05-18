import { BadRequestException, Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { categoryModel } from 'src/DB/model/category.model';
import { CategoryRepositoryService } from 'src/DB/repository/Category.repository.service';
import { TokenService } from 'src/common/service/token.service';
import { UserRepositoryService } from 'src/DB/repository/User.repository.service';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from 'src/DB/model/User.model';
import { AuthenticationModule } from '../auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { resolve } from 'path';
import { diskStorage } from 'multer';
import { CloudService } from 'src/common/multer/cloud.service';
import { CategoryFilterQueryDto } from './dto/update.dto';

@Module({
  imports: [
    categoryModel,
    // MulterModule.register({
    //   storage: diskStorage({
    //     destination: (req, file, cb) => {
    //       cb(null, resolve('./uploads'));
    //     },
    //     filename: (req, file, cb) => {
    //       cb(null, Date.now() + '_' + file.originalname);
    //     },
    //   }),
    //   fileFilter: (req, file, cb) => {
    //     if ((!['image/jpeg'].includes(file.mimetype))) {
    //     return  cb(new BadRequestException('In-valid file format'),false)

    //     }
    //     cb(null, true);
    //   },
    //   limits: {
    //     fileSize: 1024* 1024*10, // 10MB
    //   }
    // }),
    categoryModel,
  ],
  controllers: [CategoryController],
  providers: [CategoryService, CloudService, CategoryRepositoryService],
})
export class CategoryModule {}
