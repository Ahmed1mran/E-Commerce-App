import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { Field, InputType } from '@nestjs/graphql';
import { IsString, MinLength, IsOptional } from 'class-validator';
import { OrderStatus } from '../order.interface';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}

@InputType()
export class FilterOrderDto {
  @Field(() => OrderStatus, { nullable: true })
  @IsString()
  @MinLength(3)
  @IsOptional()
  status?: OrderStatus;
}
