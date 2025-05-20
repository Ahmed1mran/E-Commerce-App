import { Injectable } from '@nestjs/common';
import { AddToCartDto } from './dto/create-cart.dto';
import { UserDocument } from 'src/DB/model/User.model';
import { ProductRepositoryService } from 'src/DB/repository/Product.repository.service copy';
import { CartRepositoryService } from 'src/DB/repository/Cart.repository.service';
import { ItemIdsDto } from './dto/update-cart.dto';
import { ICart } from './cart.interface';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepositoryService: CartRepositoryService,
    private readonly productRepositoryService: ProductRepositoryService,
  ) {}
  async addToCart(
    user: UserDocument,
    body: AddToCartDto,
  ): Promise<{ message: string }> {
    const product = await this.productRepositoryService.findOne({
      filter: {
        _id: body.productId,
        stock: { $gte: body.quantity },
      },
    });
    if (!product) {
      throw new Error('Product not found or out of stock');
    }

    const cart = await this.cartRepositoryService.findOne({
      filter: {
        createdBy: user._id,
      },
    });

    if (!cart) {
      await this.cartRepositoryService.create({
        createdBy: user._id,
        products: [body],
      });
      return { message: 'Done' };
    }
    let match = false;
    for (const [index, product] of cart.products.entries()) {
      if (product.productId.toString() === body.productId.toString()) {
        cart.products[index].quantity += body.quantity;
        match = true;
        break;
      }
    }
    if (!match) {
      cart.products.push(body);
    }
    await cart.save();
    return { message: 'Done' };
  }
  async removeItemsFromCart(
    user: UserDocument,
    body: ItemIdsDto,
  ): Promise<{ message: string }> {
     await this.cartRepositoryService.updateOne({
      filter: {
        createdBy: user._id,
      },
      data: {
        $pull: {
          products: {
            productId: { $in: body.productIds },
          },
        },
      },
    });
    return { message: 'Done' };
  }
  async clearCart(user: UserDocument): Promise<{ message: string }> {
     await this.cartRepositoryService.updateOne({
      filter: {
        createdBy: user._id,
      },
      data: {
        products: [],
      },
    });

    return { message: 'Done' };
  }
  async getCart(
    user: UserDocument,
  ): Promise<{ message: string; data: { cart: ICart | null } }> {
    const cart = await this.cartRepositoryService.findOne({
      filter: {
        createdBy: user._id,
      },
      populate: [{ path: 'products.productId' }],
    });

    return { message: 'Done', data: { cart } };
  }
}
