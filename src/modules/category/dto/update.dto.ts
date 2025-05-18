import {
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { Types } from 'mongoose';
import { QueryFilterDto } from 'src/common/dto/query.filter.dto';

export class  CategoryId {
  // @Validate((input: CategoryId) => {
  //   return Types.ObjectId.isValid(input.categoryId);
  // })

  @IsMongoId()
  categoryId: Types.ObjectId;
}
export class updateCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  name: string;
  // slug?: string;
}
export class CategoryFilterQueryDto extends QueryFilterDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;
}