import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { OneOrderResponse } from './entities/order.entity';
import { FilterOrderDto } from './dto/update-order.dto';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Auth } from 'src/common/decorators/auth.decorator';
import { RoleTypes, UserDocument } from 'src/DB/model/User.model';
import { User } from 'src/common/decorators/user.decorator';

@UsePipes(new ValidationPipe({ whitelist: true }))
@Resolver()
export class OrderResolver {
  constructor(private orderService: OrderService) {}

  @Query(() => String, { name: 'testQuery', description: 'hi hi' })
  sayHi() {
    return 'hi graphql with nestjs';
  }
  @Auth(RoleTypes.user)
  @Mutation(() => [OneOrderResponse], { name: 'listProducts' })
  list(
    @User() user: UserDocument,
    @Args('filterOrder', { nullable: true }) filterOrderDto?: FilterOrderDto,
  ) {
    console.log({ user });
    console.log(filterOrderDto);
    return this.orderService.findAll();
  }
}
