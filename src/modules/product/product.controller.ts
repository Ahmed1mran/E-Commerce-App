import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import {
  CreateProductDto,
  CreateProductFilesDto,
} from './dto/create-product.dto';
import {
  FindProductFilter,
  ProductIdDto,
  UpdateProductDto,
} from './dto/update-product.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { RoleTypes, UserDocument } from 'src/DB/model/User.model';
import { User } from 'src/common/decorators/user.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  attachmentValidation,
  multerCloudOptions,
} from 'src/common/multer/cloud.multer.options';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
@UsePipes(new ValidationPipe({ whitelist: true }))
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'gallery', maxCount: 3 },
      ],
      multerCloudOptions({ fileValidators: attachmentValidation.image }),
    ),
  )
  @Auth(RoleTypes.admin)
  @Post()
  create(
    @User() user: UserDocument,
    @Body() body: CreateProductDto,
    @UploadedFiles()
    files: CreateProductFilesDto,
  ) {
    console.log(user, body, files);
    return this.productService.create(user, body, files);
    // return this.productService.create(CreateProductDto);
  }
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'gallery', maxCount: 3 },
      ],
      multerCloudOptions({ fileValidators: attachmentValidation.image }),
    ),
  )
  @Auth(RoleTypes.admin)
  @Patch(':productId')
  update(
    @User() user: UserDocument,
    @Param() params: ProductIdDto,
    @Body() body: UpdateProductDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
  ) {
    return this.productService.update(user, params.productId, body, files);
  }
  @Get()
  list(@Query() query: FindProductFilter) {
    return this.productService.list(query);
  }
  @CacheTTL(5000)
  @UseInterceptors(CacheInterceptor)
  @Get('all')
  all() {
    return this.productService.all();
  }
  @CacheKey('events')
  // @CacheTTL(5000)
  @UseInterceptors(CacheInterceptor)
  @Get('test')
  test() {
    return this.productService.test();
  }
  @Get('final')
  final() {
    return this.productService.final();
  }
}
