import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { RoleTypes, UserDocument } from 'src/DB/model/User.model';
import { Auth } from 'src/common/decorators/auth.decorator';
import { AuthenticationGuard } from 'src/common/guard/authentication/authentication.guard';
import { AuthorizationGuard } from 'src/common/guard/authorization/authorization.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { resolve } from 'path';
import { localMulterOptions } from 'src/common/multer/multer.options';
import {
  attachmentValidation,
  multerCloudOptions,
} from 'src/common/multer/cloud.multer.options';
import { CreateCategoryDto } from './dto/create.dto';
import { User } from 'src/common/decorators/user.decorator';
import { MulterValidationInterceptor } from 'src/common/multer/multer-validation/multer-validation.interceptor';
import { CategoryFilterQueryDto, CategoryId, updateCategoryDto } from './dto/update.dto';
@UsePipes(new ValidationPipe({ whitelist: true }))
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  @Auth(RoleTypes.admin)
  @UseInterceptors(
    FileInterceptor(
      'file',
      multerCloudOptions({
        fileValidators: attachmentValidation.image,
        fileSize: 1024 * 1024 * 10,
      }),
    ),
    MulterValidationInterceptor,
  )
  // @Auth([RoleTypes.admin])
  @Post()
  create(
    @User() user: UserDocument,
    @Body() body: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.categoryService.create(user, body, file);
  }

  @Auth(RoleTypes.admin)
  @UseInterceptors(
    FileInterceptor(
      'file',
      multerCloudOptions({
        fileValidators: attachmentValidation.image,
        fileSize: 1024 * 1024 * 10,
      }),
    ),
    // MulterValidationInterceptor,
  )
  // @Auth([RoleTypes.admin])
  @Patch(':categoryId')
  update(
    @User() user: UserDocument,
    @Param() params: CategoryId,
    @Body() body?: updateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.categoryService.update(user, params.categoryId, body, file);
  }
  @Get(':categoryId')
  findById(
    @Param() params: CategoryId,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.categoryService.findById(params.categoryId);
  }
  @Get()
  find(
    @Query() query:CategoryFilterQueryDto
  ) {
    return this.categoryService.find(query);
  }
}
