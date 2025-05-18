import {
  IsArray,
  IsMongoId,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IProductInput, Size } from '../product.interface';
import { Types } from 'mongoose';
import { ICategory } from 'src/modules/category/category.interface';
import { Type } from 'class-transformer';

export class CreateProductFilesDto {
  @IsArray()
  @MinLength(1)
  image: Express.Multer.File[];
  @IsArray()
  @IsOptional()
  gallery?: Express.Multer.File[];
}

export class CreateProductDto implements IProductInput {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;
  @IsString()
  @MinLength(2)
  @MaxLength(5000)
  description: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  stock: number;
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  originalPrice: number;
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  discountPercent?: number;
  @IsMongoId()
  categoryId: Types.ObjectId ;

  @IsArray()
  @IsOptional()
  size?: Size[];

  @IsArray()
  @IsOptional()
  colors?: Size[];
}
