import { Injectable } from '@nestjs/common';
import { AddToCartDto } from './dto/create-cart.dto';
import { UserDocument } from 'src/DB/model/User.model';
import { ProductRepositoryService } from 'src/DB/repository/Product.repository.service copy';
import { ProductDocument } from 'src/DB/model/Product.model';
import { CartRepositoryService } from 'src/DB/repository/Cart.repository.service';
import { CartDocument } from 'src/DB/model/Cart.model';
import { ItemIdsDto } from './dto/update-cart.dto';
import { ICart } from './cart.interface';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepositoryService: CartRepositoryService<CartDocument>,
    private readonly productRepositoryService: ProductRepositoryService<ProductDocument>,
  ) {}
  async addToCart(
    user: UserDocument,
    body: AddToCartDto,
  ): Promise<{ message: String }> {
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
        // product: body.productId,
      },
    });
    //     if (!cart) {
    //   const newCart = await this.cartRepositoryService.create({
    //     createdBy: user._id,
    //     products: [{ productId: body.productId, quantity: body.quantity }],
    //   });
    //   return newCart;
    // } else {
    //   const existingProduct = cart.products.find(
    //     (product) => product.productId.toString() === body.productId.toString(),
    //   );

    //   if (existingProduct) {
    //     existingProduct.quantity += body.quantity;
    //   } else {
    //     cart.products.push({ productId: body.productId, quantity: body.quantity });
    //   }

    //   await cart.save();
    //   return cart;
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
        // await cart.save();
        // return { message: 'Done' };
      }
      // else {
      //   cart.products.push(body);
      //   await cart.save();
      //   return { message: 'Done' };
      // }
    }
    if (!match) {
      cart.products.push(body);
    }
    await cart.save();
    return { message: 'Done' };

    // return 'This action adds a new cart';
  }
  async removeItemsFromCart(
    user: UserDocument,
    body: ItemIdsDto,
  ): Promise<{ message: String }> {
    const cart = await this.cartRepositoryService.updateOne({
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
    // if (!cart) {
    //   throw new Error('Cart not found');
    // }
    // cart.products = cart.products.filter(
    //   (product) => !body.productIds.includes(product.productId),
    // );
    // await cart.save();
    return { message: 'Done' };
  }
  async clearCart(user: UserDocument): Promise<{ message: String }> {
    const cart = await this.cartRepositoryService.updateOne({
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
  ): Promise<{ message: String; data: { cart: ICart | null } }> {
    const cart = await this.cartRepositoryService.findOne({
      filter: {
        createdBy: user._id,
      },
      populate: [{ path: 'products.productId' }],
    });

    return { message: 'Done', data: { cart } };
  }
}
