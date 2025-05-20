import {
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Types } from 'mongoose';
import { QueryFilterDto } from 'src/common/dto/query.filter.dto';

export class CategoryId {
  @IsMongoId()
  categoryId: Types.ObjectId;
}
export class updateCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  name: string;
}
export class CategoryFilterQueryDto extends QueryFilterDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;
}
