import { IsString, MaxLength, MinLength } from 'class-validator';
import { ICreateCategoryInput } from '../category.interface';

export class CreateCategoryDto implements ICreateCategoryInput {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;
}
