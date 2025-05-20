import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { CartService } from './cart.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { RoleTypes, UserDocument } from 'src/DB/model/User.model';
import { User } from 'src/common/decorators/user.decorator';
import { AddToCartDto } from './dto/create-cart.dto';
import { ItemIdsDto } from './dto/update-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
  @Auth(RoleTypes.user)
  @Post()
  addToCart(@User() user: UserDocument, @Body() body: AddToCartDto) {
    return this.cartService.addToCart(user, body);
  }

  @Auth(RoleTypes.user)
  @Patch()
  removeItemsFromCart(@User() user: UserDocument, @Body() body: ItemIdsDto) {
    return this.cartService.removeItemsFromCart(user, body);
  }

  @Auth(RoleTypes.user)
  @Delete()
  clearCart(@User() user: UserDocument) {
    return this.cartService.clearCart(user);
  }

  @Auth(RoleTypes.user)
  @Get()
  getCart(@User() user: UserDocument) {
    return this.cartService.getCart(user);
  }
}
