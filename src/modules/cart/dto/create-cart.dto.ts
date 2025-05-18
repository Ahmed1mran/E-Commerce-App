import { IsMongoId, IsNumber, IsPositive } from 'class-validator';
import { Types } from 'mongoose';

export class AddToCartDto {
  @IsMongoId()
  productId: Types.ObjectId;

  @IsNumber()
  @IsPositive()
  quantity: number;
}
