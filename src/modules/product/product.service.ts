import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UserDocument } from 'src/DB/model/User.model';
import { CategoryRepositoryService } from 'src/DB/repository/Category.repository.service';
import {
  CloudService,
  IAttachmentTypes,
} from 'src/common/multer/cloud.service';
import { ProductRepositoryService } from 'src/DB/repository/Product.repository.service copy';
import { FilterQuery, Types } from 'mongoose';
import { FindProductFilter, UpdateProductDto } from './dto/update-product.dto';
import { ProductDocument } from 'src/DB/model/Product.model';
import { IProduct } from './product.interface';
import { IPaginate } from 'src/DB/repository/database.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ProductService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly cloudService: CloudService,
    private readonly productRepositoryService: ProductRepositoryService,
    private readonly categoryRepositoryService: CategoryRepositoryService,
  ) {}

  async final() {
    const k = await this.cacheManager.get('events');
    return { message: 'Done', k };
  }

  async create(
    user: UserDocument,
    body: CreateProductDto,
    files: {
      image?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
  ): Promise<{ message: string }> {
    if (!files.image) {
      throw new BadRequestException('Image is required');
    }

    const category = await this.categoryRepositoryService.findOne({
      filter: { _id: body.categoryId },
    });
    if (!category) {
      throw new NotFoundException('In-valid productId');
    }

    const folderId = `${Math.floor(Math.random() * 10000)}`;
    const { secure_url, public_id } = await this.cloudService.uploadFile(
      files.image[0].path,
      {
        folder: `${process.env.APP_NAME}/category/${category.folderId}/product/${folderId}`,
      },
    );
    const image: IAttachmentTypes = {
      secure_url,
      public_id,
    };
    let gallery: IAttachmentTypes[] = [];
    if (files?.gallery?.length) {
      gallery = await this.cloudService.uploadFiles(files.gallery, {
        folder: `${process.env.APP_NAME}/category/${category.folderId}/product/${folderId}/gallery`,
      });
    }
     await this.productRepositoryService.create({
      ...body,
      folderId,
      createdBy: user._id,
      image,
      gallery,
    });
    return { message: 'Product created successfully' };
  }
  async update(
    user: UserDocument,
    productId: Types.ObjectId,
    body: UpdateProductDto,
    files?: {
      image?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
  ): Promise<{ message: string }> {
    const product = await this.productRepositoryService.findOne({
      filter: { _id: productId },
      populate: [{ path: 'categoryId' }],
    });
    if (!product) {
      throw new NotFoundException('In-valid productId');
    }
    if (body.categoryId) {
      const category = await this.categoryRepositoryService.findOne({
        filter: { _id: body.categoryId },
      });
      if (!category) {
        throw new NotFoundException('In-valid categoryId');
      }
    }

    // const folderId = `${Math.floor(Math.random() * 10000)}`;

    let image: IAttachmentTypes | null = null;
    if (files?.image?.length) {
      const { secure_url, public_id } = await this.cloudService.uploadFile(
        files.image[0].path,
        {
          folder: `${process.env.APP_NAME}/category/${product.categoryId['folderId']}/product/${product.folderId}`,
        },
      );
      image = { secure_url, public_id };
    }

    let gallery: IAttachmentTypes[] = [];
    if (files?.gallery?.length) {
      gallery = await this.cloudService.uploadFiles(files.gallery, {
        folder: `${process.env.APP_NAME}/category/${product.categoryId['folderId']}/product/${product.folderId}/gallery`,
      });
    }
    let finalPrice: number = product.finalPrice;
    if (body.originalPrice || body.discountPercent) {
      finalPrice = this.calculateFinalPrice(
        body.originalPrice || product.originalPrice,
        body.discountPercent || product.discountPercent,
      );
    }
    const updatedProduct = await this.productRepositoryService.updateOne({
      filter: { _id: productId },
      data: {
        ...body,
        image,
        gallery,
        finalPrice,
        updatedBy: user._id,
      },
    });
    if (updatedProduct.modifiedCount && files?.image?.length) {
      await this.cloudService.destroyFile(product.image.public_id);
    }
    if (
      updatedProduct.modifiedCount &&
      files?.gallery?.length &&
      product.gallery?.length
    ) {
      const ids = product.gallery.map((ele) => ele.public_id);
      await this.cloudService.destroyFiles(ids);
    }
    return { message: 'Product updated successfully' };
  }
  async list(query: FindProductFilter): Promise<{
    message: string;
    data: {
      products: IProduct[] | [] | IPaginate<IProduct>;
    };
  }> {
    let cacheName = 'products';
    if (Object.keys(query)?.length) {
      cacheName = JSON.stringify(query);
    }
    const cacheData = await this.cacheManager.get(cacheName);
    console.log({ cacheName: cacheName, cacheData: cacheData });
    if (cacheData) {
      return {
        message: 'Done-Cache',
        data: { products: JSON.parse(cacheData as string) },
      };
    }

    let filter: FilterQuery<ProductDocument> = {};
    if (query?.name) {
      filter = {
        $or: [
          { name: { $regex: `${query.name}`, $options: 'i' } },
          { slug: { $regex: `${query.name}`, $options: 'i' } },
        ],
      };
    }
    if (query?.categoryId) {
      filter.categoryId = query.categoryId;
    }
    if (query.minPrice || query.maxPrice) {
      const max = query.maxPrice ? { $lte: query.maxPrice } : {};
      filter.finalPrice = { $gte: query.minPrice || 0, ...max };
    }
    const products = await this.productRepositoryService.find({
      filter,
      select: query.select,
      page: query.page,
      sort: query.sort,
      populate: [{ path: 'categoryId' }],
    });
    const z = await this.cacheManager.set(
      cacheName,
      JSON.stringify(products),
      1000 * 60,
    );
    console.log({ z });
    return { message: 'Done', data: { products } };
  }
  async all(): Promise<{
    message: string;
    data: {
      products: IProduct[] | [] | IPaginate<IProduct>;
    };
  }> {
    const products = await this.productRepositoryService.find({
      populate: [{ path: 'categoryId' }],
    });
    console.log('all api');
    return { message: 'Done', data: { products } };
  }

  private calculateFinalPrice(
    originalPrice: number,
    discountPercent?: number,
  ): number {
    const price =
      originalPrice - ((discountPercent || 0) / 100) * originalPrice;
    return price > 0 ? price : 0;
  }
}
