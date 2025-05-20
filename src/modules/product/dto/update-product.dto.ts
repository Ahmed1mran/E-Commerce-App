import { Types } from 'mongoose';
import { CreateProductDto } from './create-product.dto';
import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { QueryFilterDto } from 'src/common/dto/query.filter.dto';
import { Type } from 'class-transformer';

export class ProductIdDto {
  @IsMongoId()
  // _id: Types.ObjectId;
  productId: Types.ObjectId;
}
export class UpdateProductDto extends PartialType(CreateProductDto) {
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
  categoryId: Types.ObjectId;
}

export class FindProductFilter extends QueryFilterDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  minPrice?: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  maxPrice?: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  stock: number;

  @IsMongoId()
  @IsOptional()
  categoryId?: string;
}
