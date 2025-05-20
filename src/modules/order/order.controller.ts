import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderIdDto } from './dto/create-order.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { RoleTypes, UserDocument } from 'src/DB/model/User.model';
import { Request } from 'express';

@UsePipes(new ValidationPipe({ whitelist: true }))
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @Auth(RoleTypes.user)
  @Post('create')
  create(@User() user: UserDocument, @Body() body: CreateOrderDto) {
    return this.orderService.create(user, body);
  }

  @Post('webhook')
  webhook(@Req() req: Request) {
    console.log('start');

    return this.orderService.webhook(req);
  }
  @Auth(RoleTypes.user)
  @Post(':orderId')
  checkout(@User() user: UserDocument, @Param() params: OrderIdDto) {
    return this.orderService.checkout(user, params.orderId);
  }
  @Auth(RoleTypes.user)
  @Patch(':orderId/cancell')
  cancelOrder(@User() user: UserDocument, @Param() params: OrderIdDto) {
    return this.orderService.cancelOrder(user, params.orderId);
  }
}
